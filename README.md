### **项目概述**

这是一个基于浏览器的书签导航网页，旨在将书签数据（以 JSON 格式存储）转换为一个美观且功能丰富的网页应用。可以通过该网页方便地访问自己的书签，支持多级文件夹的展开和折叠、搜索、面包屑导航等功能。

本人技术目前仅限于此，只做了这个静态部署的网页项目(仅学了两个星期前端)，小bug真的修不完，抱歉😥
移动端显示问题暂未解决,要求高建议看一下Pintree和TabMark，是两个个成熟项目了（前者开源有付费模式，后者闭源）

PC：

![image](https://github.com/user-attachments/assets/1432c882-c63b-47f2-b9ca-db3199253dee)      ![image](https://github.com/user-attachments/assets/26f70f91-5ec9-4585-a94f-52c690f5f0bc)


移动端：

![image](https://github.com/user-attachments/assets/a8302f6e-0dca-49bc-80ee-8792ba725fca)      ![image](https://github.com/user-attachments/assets/7267e7e6-5ff6-423e-85ef-ac670c1d2f31)


* * *

### **核心功能**

1. **侧边栏导航**：
   
   * 显示一级文件夹。
   
   * 点击一级文件夹时，在右侧主内容区显示子文件夹和书签。
   
   * 支持多级文件夹的嵌套展开和折叠。

2. **主内容区**：
   
   * 显示当前文件夹的子文件夹和书签。
   
   * 书签以卡片形式展示，支持点击跳转。
   
   * 文件夹以图标形式展示，支持点击进入子文件夹。

3. **面包屑导航**：
   
   * 显示当前路径（点击的文件夹层级）。
   
   * 支持通过面包屑导航返回上一级。

4. **搜索功能**：
   
   * 支持按标题搜索书签。
   
   * 搜索结果会替换主内容区的内容。
  
   * 支持实时渲染。

5. **主题切换**：
   
   * 支持深色模式和浅色模式切换。

6. **移动端支持**：
   
   * 支持移动端响应式布局

* * *

### **未来改进方向**

1. **书签管理功能**：
   
   * 提供书签导入和导出功能。

2. **用户自定义**：
   
   * 允许用户自定义主题颜色和布局。
   
   * 支持用户添加自定义图标和描述。

4. **性能优化**：
   
   * 对于大量书签数据，优化渲染性能。
   
   * 实现懒加载，减少初始加载时间。

---

### **未完成的功能**

1. **自动获取网页的icon或缩略图**
