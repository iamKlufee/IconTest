// 全局变量
let currentPaperData = null;

// DOM元素
const doiInput = document.getElementById('doi-input');
const fetchBtn = document.getElementById('fetch-btn');
const loadingSection = document.getElementById('loading');
const errorSection = document.getElementById('error');
const errorText = document.getElementById('error-text');
const resultsSection = document.getElementById('results');
const paperDetails = document.getElementById('paper-details');
const copyBtn = document.getElementById('copy-btn');

// 引用格式容器
const citationFormats = {
    apa: document.getElementById('apa-citation'),
    mla: document.getElementById('mla-citation'),
    chicago: document.getElementById('chicago-citation'),
    harvard: document.getElementById('harvard-citation'),
    ieee: document.getElementById('ieee-citation')
};

// 事件监听器
document.addEventListener('DOMContentLoaded', function() {
    fetchBtn.addEventListener('click', handleFetchCitation);
    doiInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleFetchCitation();
        }
    });
    
    // 标签页切换
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.format);
        });
    });
    
    // 复制按钮
    copyBtn.addEventListener('click', copyCurrentCitation);
});

// 处理DOI查询
async function handleFetchCitation() {
    const doi = doiInput.value.trim();
    
    if (!doi) {
        showError('请输入DOI');
        return;
    }
    
    // 清理DOI格式
    const cleanDOI = cleanDOIFormat(doi);
    
    showLoading();
    hideError();
    hideResults();
    
    try {
        const paperData = await fetchPaperData(cleanDOI);
        currentPaperData = paperData;
        displayResults(paperData);
        generateAllCitations(paperData);
    } catch (error) {
        showError(error.message);
    }
}

// 清理DOI格式
function cleanDOIFormat(doi) {
    // 移除URL前缀
    let cleanDOI = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, '');
    cleanDOI = cleanDOI.replace(/^doi:/, '');
    
    // 确保以10.开头
    if (!cleanDOI.startsWith('10.')) {
        throw new Error('DOI格式不正确，应以10.开头');
    }
    
    return cleanDOI;
}

// 获取文献数据
async function fetchPaperData(doi) {
    try {
        // 使用Crossref API
        const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('未找到该DOI对应的文献');
            } else if (response.status === 429) {
                throw new Error('请求过于频繁，请稍后再试');
            } else {
                throw new Error('获取文献信息失败');
            }
        }
        
        const data = await response.json();
        const work = data.message;
        
        return {
            title: work.title ? work.title[0] : '未知标题',
            authors: work.author || [],
            journal: work['container-title'] ? work['container-title'][0] : '未知期刊',
            year: work['published-print'] ? work['published-print']['date-parts'][0][0] : 
                  work['published-online'] ? work['published-online']['date-parts'][0][0] : 
                  work['created']['date-parts'][0][0],
            volume: work.volume || '',
            issue: work.issue || '',
            pages: work.page || '',
            doi: work.DOI,
            publisher: work.publisher || '',
            url: work.URL || `https://doi.org/${work.DOI}`,
            abstract: work.abstract || ''
        };
    } catch (error) {
        if (error.message.includes('fetch')) {
            throw new Error('网络连接失败，请检查网络连接');
        }
        throw error;
    }
}

// 显示结果
function displayResults(paperData) {
    hideLoading();
    hideError();
    
    // 显示文献信息
    paperDetails.innerHTML = `
        <div class="paper-detail">
            <strong>标题:</strong>
            <span>${paperData.title}</span>
        </div>
        <div class="paper-detail">
            <strong>作者:</strong>
            <span>${formatAuthors(paperData.authors)}</span>
        </div>
        <div class="paper-detail">
            <strong>期刊:</strong>
            <span>${paperData.journal}</span>
        </div>
        <div class="paper-detail">
            <strong>年份:</strong>
            <span>${paperData.year}</span>
        </div>
        ${paperData.volume ? `
        <div class="paper-detail">
            <strong>卷号:</strong>
            <span>${paperData.volume}</span>
        </div>
        ` : ''}
        ${paperData.issue ? `
        <div class="paper-detail">
            <strong>期号:</strong>
            <span>${paperData.issue}</span>
        </div>
        ` : ''}
        ${paperData.pages ? `
        <div class="paper-detail">
            <strong>页码:</strong>
            <span>${paperData.pages}</span>
        </div>
        ` : ''}
        <div class="paper-detail">
            <strong>DOI:</strong>
            <span><a href="${paperData.url}" target="_blank">${paperData.doi}</a></span>
        </div>
    `;
    
    resultsSection.style.display = 'block';
}

// 格式化作者列表
function formatAuthors(authors) {
    if (!authors || authors.length === 0) return '未知作者';
    
    return authors.map(author => {
        const given = author.given || '';
        const family = author.family || '';
        return `${given} ${family}`.trim();
    }).join(', ');
}

// 生成所有引用格式
function generateAllCitations(paperData) {
    citationFormats.apa.textContent = generateAPACitation(paperData);
    citationFormats.mla.textContent = generateMLACitation(paperData);
    citationFormats.chicago.textContent = generateChicagoCitation(paperData);
    citationFormats.harvard.textContent = generateHarvardCitation(paperData);
    citationFormats.ieee.textContent = generateIEEECitation(paperData);
}

// APA格式
function generateAPACitation(paperData) {
    const authors = formatAPAAuthors(paperData.authors);
    const year = paperData.year;
    const title = paperData.title;
    const journal = paperData.journal;
    const volume = paperData.volume;
    const issue = paperData.issue;
    const pages = paperData.pages;
    const doi = paperData.doi;
    
    let citation = `${authors} (${year}). ${title}. ${journal}`;
    
    if (volume) {
        citation += `, ${volume}`;
        if (issue) {
            citation += `(${issue})`;
        }
    }
    
    if (pages) {
        citation += `, ${pages}`;
    }
    
    citation += `. https://doi.org/${doi}`;
    
    return citation;
}

// MLA格式
function generateMLACitation(paperData) {
    const authors = formatMLAAuthors(paperData.authors);
    const title = paperData.title;
    const journal = paperData.journal;
    const volume = paperData.volume;
    const issue = paperData.issue;
    const year = paperData.year;
    const pages = paperData.pages;
    const doi = paperData.doi;
    
    let citation = `${authors}. "${title}." ${journal}`;
    
    if (volume) {
        citation += `, vol. ${volume}`;
        if (issue) {
            citation += `, no. ${issue}`;
        }
    }
    
    citation += `, ${year}`;
    
    if (pages) {
        citation += `, pp. ${pages}`;
    }
    
    citation += `, https://doi.org/${doi}`;
    
    return citation;
}

// Chicago格式
function generateChicagoCitation(paperData) {
    const authors = formatChicagoAuthors(paperData.authors);
    const title = paperData.title;
    const journal = paperData.journal;
    const volume = paperData.volume;
    const issue = paperData.issue;
    const year = paperData.year;
    const pages = paperData.pages;
    const doi = paperData.doi;
    
    let citation = `${authors}. "${title}." ${journal}`;
    
    if (volume) {
        citation += ` ${volume}`;
        if (issue) {
            citation += `, no. ${issue}`;
        }
    }
    
    citation += ` (${year})`;
    
    if (pages) {
        citation += `: ${pages}`;
    }
    
    citation += `. https://doi.org/${doi}`;
    
    return citation;
}

// Harvard格式
function generateHarvardCitation(paperData) {
    const authors = formatHarvardAuthors(paperData.authors);
    const year = paperData.year;
    const title = paperData.title;
    const journal = paperData.journal;
    const volume = paperData.volume;
    const issue = paperData.issue;
    const pages = paperData.pages;
    const doi = paperData.doi;
    
    let citation = `${authors} ${year}, '${title}', ${journal}`;
    
    if (volume) {
        citation += `, vol. ${volume}`;
        if (issue) {
            citation += `, no. ${issue}`;
        }
    }
    
    if (pages) {
        citation += `, pp. ${pages}`;
    }
    
    citation += `, viewed ${new Date().toLocaleDateString()}, https://doi.org/${doi}`;
    
    return citation;
}

// IEEE格式
function generateIEEECitation(paperData) {
    const authors = formatIEEEAuthors(paperData.authors);
    const title = paperData.title;
    const journal = paperData.journal;
    const volume = paperData.volume;
    const issue = paperData.issue;
    const year = paperData.year;
    const pages = paperData.pages;
    const doi = paperData.doi;
    
    let citation = `${authors}, "${title}," ${journal}`;
    
    if (volume) {
        citation += `, vol. ${volume}`;
        if (issue) {
            citation += `, no. ${issue}`;
        }
    }
    
    citation += `, pp. ${pages || '1-10'}, ${year}`;
    
    return citation;
}

// 格式化作者 - APA
function formatAPAAuthors(authors) {
    if (!authors || authors.length === 0) return '未知作者';
    
    if (authors.length === 1) {
        return formatSingleAuthorAPA(authors[0]);
    } else if (authors.length <= 7) {
        const formattedAuthors = authors.map(author => formatSingleAuthorAPA(author));
        const lastAuthor = formattedAuthors.pop();
        return formattedAuthors.join(', ') + ', & ' + lastAuthor;
    } else {
        const firstAuthor = formatSingleAuthorAPA(authors[0]);
        return firstAuthor + ' et al.';
    }
}

function formatSingleAuthorAPA(author) {
    const family = author.family || '';
    const given = author.given || '';
    const initials = given.split(' ').map(name => name.charAt(0) + '.').join(' ');
    return `${family}, ${initials}`;
}

// 格式化作者 - MLA
function formatMLAAuthors(authors) {
    if (!authors || authors.length === 0) return '未知作者';
    
    if (authors.length === 1) {
        return formatSingleAuthorMLA(authors[0]);
    } else if (authors.length <= 3) {
        return authors.map(author => formatSingleAuthorMLA(author)).join(', ');
    } else {
        const firstAuthor = formatSingleAuthorMLA(authors[0]);
        return firstAuthor + ' et al.';
    }
}

function formatSingleAuthorMLA(author) {
    const family = author.family || '';
    const given = author.given || '';
    return `${family}, ${given}`;
}

// 格式化作者 - Chicago
function formatChicagoAuthors(authors) {
    if (!authors || authors.length === 0) return '未知作者';
    
    if (authors.length === 1) {
        return formatSingleAuthorChicago(authors[0]);
    } else if (authors.length <= 10) {
        const formattedAuthors = authors.map(author => formatSingleAuthorChicago(author));
        const lastAuthor = formattedAuthors.pop();
        return formattedAuthors.join(', ') + ', and ' + lastAuthor;
    } else {
        const firstAuthor = formatSingleAuthorChicago(authors[0]);
        return firstAuthor + ' et al.';
    }
}

function formatSingleAuthorChicago(author) {
    const family = author.family || '';
    const given = author.given || '';
    return `${given} ${family}`;
}

// 格式化作者 - Harvard
function formatHarvardAuthors(authors) {
    if (!authors || authors.length === 0) return '未知作者';
    
    if (authors.length === 1) {
        return formatSingleAuthorHarvard(authors[0]);
    } else if (authors.length <= 3) {
        return authors.map(author => formatSingleAuthorHarvard(author)).join(', ');
    } else {
        const firstAuthor = formatSingleAuthorHarvard(authors[0]);
        return firstAuthor + ' et al.';
    }
}

function formatSingleAuthorHarvard(author) {
    const family = author.family || '';
    const given = author.given || '';
    return `${family}, ${given}`;
}

// 格式化作者 - IEEE
function formatIEEEAuthors(authors) {
    if (!authors || authors.length === 0) return '未知作者';
    
    if (authors.length === 1) {
        return formatSingleAuthorIEEE(authors[0]);
    } else if (authors.length <= 6) {
        return authors.map(author => formatSingleAuthorIEEE(author)).join(', ');
    } else {
        const firstAuthor = formatSingleAuthorIEEE(authors[0]);
        return firstAuthor + ' et al.';
    }
}

function formatSingleAuthorIEEE(author) {
    const family = author.family || '';
    const given = author.given || '';
    const initials = given.split(' ').map(name => name.charAt(0)).join('.');
    return `${initials}. ${family}`;
}

// 切换标签页
function switchTab(format) {
    // 移除所有活动状态
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.citation-format').forEach(format => format.classList.remove('active'));
    
    // 激活选中的标签页
    document.querySelector(`[data-format="${format}"]`).classList.add('active');
    document.getElementById(`${format}-citation`).classList.add('active');
}

// 复制当前引用
async function copyCurrentCitation() {
    const activeFormat = document.querySelector('.citation-format.active');
    const citationText = activeFormat.textContent;
    
    try {
        await navigator.clipboard.writeText(citationText);
        copyBtn.innerHTML = '<i class="fas fa-check"></i> 已复制';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制引用';
            copyBtn.classList.remove('copied');
        }, 2000);
    } catch (error) {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = citationText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        copyBtn.innerHTML = '<i class="fas fa-check"></i> 已复制';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> 复制引用';
            copyBtn.classList.remove('copied');
        }, 2000);
    }
}

// 显示/隐藏函数
function showLoading() {
    loadingSection.style.display = 'block';
    fetchBtn.disabled = true;
    fetchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 获取中...';
}

function hideLoading() {
    loadingSection.style.display = 'none';
    fetchBtn.disabled = false;
    fetchBtn.innerHTML = '<i class="fas fa-search"></i> 获取引用';
}

function showError(message) {
    errorText.textContent = message;
    errorSection.style.display = 'block';
    hideLoading();
}

function hideError() {
    errorSection.style.display = 'none';
}

function hideResults() {
    resultsSection.style.display = 'none';
}

