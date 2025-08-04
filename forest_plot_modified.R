# 1. 检查并安装 forestplot 包（如果尚未安装）
if (!requireNamespace("forestplot", quietly = TRUE)) {
    install.packages("forestplot")
}

# 加载 forestplot 和 grid 包
library(forestplot)
library(grid)

# 2. 将您的数据创建为 R 数据框
df_data <- data.frame(
  Variable = c(
    "NT-IGFBP-4", "lg(NTproBNP)", "Age", "Sex", "eGFR", "Heart rate", 
    "Respiratory rate", "Systolic blood pressure", "Diastolic blood pressure", 
    "Hypertension", "Diabetes mellitus", "Renal insufficiency", "AMI", 
    "Heart valve disease", "Arrhythmia", "Dilated cardiomyopathy", 
    "Hypertrophic cardiomyopathy", "Current smoker", "Current drinker", 
    "RAASI (ARNI/ACEI/ARB)", "B-blocker", "Diuretics/ Digitalis", 
    "Statin", "Calcium antagonist", "SGLT2i", "ICD implantation"
  ),
  HR = c(
    2.848, 1.546, 1.300, 1.008, 0.996, 1.004, 0.971, 0.987, 0.998, 
    1.076, 1.288, 1.017, 1.497, 1.022, 1.918, 1.133, 2.250, 1.166, 
    0.246, 1.108, 0.840, 0.485, 0.919, 1.464, 1.003, 1.354
  ),
  Lower_ci = c(
    1.491, 0.909, 0.739, 0.985, 0.982, 0.993, 0.839, 0.973, 0.976, 
    0.617, 0.748, 0.517, 0.796, 0.610, 1.082, 0.597, 0.697, 0.602, 
    0.071, 0.663, 0.497, 0.229, 0.525, 0.630, 0.516, 0.597
  ),
  Upper_ci = c(
    5.439, 2.628, 2.285, 1.032, 1.009, 1.015, 1.125, 1.001, 1.020, 
    1.877, 2.218, 2.001, 2.816, 1.714, 3.400, 2.150, 7.269, 2.259, 
    0.854, 1.851, 1.418, 1.027, 1.608, 3.404, 1.949, 3.070
  ),
  P_value = c(
    0.002, 0.108, 0.363, 0.493, 0.529, 0.476, 0.698, 0.062, 0.828, 
    0.795, 0.361, 0.961, 0.211, 0.934, 0.026, 0.703, 0.175, 0.649, 
    0.027, 0.697, 0.514, 0.059, 0.768, 0.375, 0.994, 0.468
  )
)

# 3. 格式化P值显示
p_value_formatted <- ifelse(df_data$P_value < 0.001, "<0.001",
                           ifelse(df_data$P_value < 0.01, "<0.01",
                                  ifelse(df_data$P_value < 0.05, "<0.05",
                                         as.character(round(df_data$P_value, 3)))))

# 4. 创建用于图表左侧的文本标签 - 重新设计为四列布局
# 第一列：变量名
# 第二列：空白（用于森林图）
# 第三列：HR数据
# 第四列：P值
table_text <- cbind(
  c("Variable", as.character(df_data$Variable)),  # 第一列：变量名
  c("", rep("", nrow(df_data))),  # 第二列：空白（用于森林图）
  c("HR", as.character(round(df_data$HR, 2))),  # 第三列：HR值
  c("P-value", p_value_formatted)  # 第四列：P值
)

# 5. 生成森林图并保存为 PNG 文件
png("forest_plot_corrected.png", width = 1600, height = 800, res = 100) # 增加宽度以适应新布局

print(
  forestplot(
    labeltext = table_text,
    mean = c(NA, df_data$HR),
    lower = c(NA, df_data$Lower_ci),
    upper = c(NA, df_data$Upper_ci),
    zero = 1, # 零效应线位置，对于HR为1
    ci.vertices = TRUE, # 显示置信区间的顶点
    boxsize = 0.25, # 设置盒子的相对大小
    lwd.ci = 1.5, # 设置置信区间线的宽度
    col = fpColors(box = "royalblue",
                   lines = "darkblue",
                   summary = "red"), # 自定义颜色
    vertices.gp = gpar(lwd = 0.1), # 设置顶点线宽
    xticks = c(0, 1, 2, 3, 4, 5, 6, 7), # 设置X轴刻度
    is.summary = c(TRUE, rep(FALSE, nrow(df_data))), # 将第一行标题作为汇总行处理
    txt_gp = fpTxtGp(
      label = gpar(cex = 0.8),
      ticks = gpar(cex = 0.8),
      xlab = gpar(cex = 0.8),
      title = gpar(cex = 1.2)
    ),
    title = "Forest Plot of Hazard Ratios", # 图表标题
    xlab = "Hazard Ratio (HR)", # X轴标签
    # 设置图形宽度和位置
    graphwidth = unit(100, "mm"), # 设置图形宽度
    # 设置各列的对齐方式
    align = c("l", "c", "r", "r") # 左对齐、居中、右对齐、右对齐
  )
)
dev.off()

# 6. 创建另一个版本，将HR和CI合并显示
png("forest_plot_hr_ci_combined.png", width = 1600, height = 800, res = 100)

# 合并HR和CI显示
table_text_combined <- cbind(
  c("Variable", as.character(df_data$Variable)),  # 第一列：变量名
  c("", rep("", nrow(df_data))),  # 第二列：空白（用于森林图）
  c("HR (95% CI)", paste0(round(df_data$HR, 2), " (", 
                           round(df_data$Lower_ci, 2), "-", 
                           round(df_data$Upper_ci, 2), ")")),  # 第三列：HR和CI
  c("P-value", p_value_formatted)  # 第四列：P值
)

print(
  forestplot(
    labeltext = table_text_combined,
    mean = c(NA, df_data$HR),
    lower = c(NA, df_data$Lower_ci),
    upper = c(NA, df_data$Upper_ci),
    zero = 1,
    ci.vertices = TRUE,
    boxsize = 0.25,
    lwd.ci = 1.5,
    col = fpColors(box = "royalblue",
                   lines = "darkblue",
                   summary = "red"),
    vertices.gp = gpar(lwd = 0.1),
    xticks = c(0, 1, 2, 3, 4, 5, 6, 7),
    is.summary = c(TRUE, rep(FALSE, nrow(df_data))),
    txt_gp = fpTxtGp(
      label = gpar(cex = 0.8),
      ticks = gpar(cex = 0.8),
      xlab = gpar(cex = 0.8),
      title = gpar(cex = 1.2)
    ),
    title = "Forest Plot of Hazard Ratios",
    xlab = "Hazard Ratio (HR)",
    graphwidth = unit(100, "mm"),
    align = c("l", "c", "r", "r")
  )
)
dev.off()

# 7. 创建一个更紧凑的版本
png("forest_plot_compact_final.png", width = 1400, height = 800, res = 100)

# 简化表格文本
table_text_compact <- cbind(
  c("Variable", as.character(df_data$Variable)),
  c("", rep("", nrow(df_data))),
  c("HR", as.character(round(df_data$HR, 2))),
  c("P", p_value_formatted)
)

print(
  forestplot(
    labeltext = table_text_compact,
    mean = c(NA, df_data$HR),
    lower = c(NA, df_data$Lower_ci),
    upper = c(NA, df_data$Upper_ci),
    zero = 1,
    ci.vertices = TRUE,
    boxsize = 0.25,
    lwd.ci = 1.5,
    col = fpColors(box = "royalblue",
                   lines = "darkblue"),
    vertices.gp = gpar(lwd = 0.1),
    xticks = c(0, 1, 2, 3, 4, 5, 6, 7),
    is.summary = c(TRUE, rep(FALSE, nrow(df_data))),
    txt_gp = fpTxtGp(
      label = gpar(cex = 0.8),
      ticks = gpar(cex = 0.8),
      xlab = gpar(cex = 0.8),
      title = gpar(cex = 1.2)
    ),
    title = "Forest Plot of Hazard Ratios",
    xlab = "Hazard Ratio (HR)",
    graphwidth = unit(80, "mm"),
    align = c("l", "c", "r", "r")
  )
)
dev.off() 