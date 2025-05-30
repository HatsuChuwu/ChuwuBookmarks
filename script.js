/**
 * 主题、设备适配、渲染和搜索功能模块
 */

const animationConfig = {
    duration: {
        short: 0.15,
        base: 0.2,
        medium: 0.3,
        long: 0.5,
    },
    ease: {
        inOutCubic: "cubic-bezier(0.4, 0, 0.2, 1)",
        outQuad: "power1.out",
        default: "ease",
    }
};

/** 主题相关 */
const initTheme = () => {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
};

// 焦点管理
const initFocusManagement = () => {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            const focusableElements = document.querySelectorAll('[tabindex]:not([tabindex="-1"]), a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"]');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            } else if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        }
    });
};

const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    // 使用requestAnimationFrame优化渲染
    requestAnimationFrame(() => {
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
};

/** 设备和视图适配 */
const isMobileDevice = () => {
    // 像素检测（原有逻辑）
    const isSmallScreen = window.innerWidth <= 1300;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

    // UA检测（新增逻辑）
    const ua = navigator.userAgent.toLowerCase();
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(ua);

    // 特殊情况处理：iPad等平板设备可能有较大屏幕但仍是移动设备
    const isTablet = /ipad|android(?!.*mobile)/i.test(ua);

    // 综合判断：像素检测 或 UA检测为移动设备
    return isSmallScreen || isCoarsePointer || isMobileUA || isTablet;
};

const updateSidebarState = (sidebar, isCollapsed) => {
    sidebar.classList.toggle('collapsed', isCollapsed);
    const toggleButton = document.getElementById('toggle-sidebar');
    const showPanel = toggleButton.querySelector('.show-panel');
    const hidePanel = toggleButton.querySelector('.hide-panel');
    showPanel.style.display = isCollapsed ? 'block' : 'none';
    hidePanel.style.display = isCollapsed ? 'none' : 'block';
    adjustHomeMessagePosition(isCollapsed);

    // 修复文件夹动画状态
    const folderElements = sidebar.querySelectorAll('.folder');

    // 添加检查确保元素存在且不为空
    if (folderElements && folderElements.length > 0) {
        if (isCollapsed) {
            // 收起时隐藏所有文件夹
            gsap.set(folderElements, { opacity: 0, visibility: 'hidden' });
        } else {
            // 展开时重置文件夹动画
            gsap.set(folderElements, { opacity: 0, visibility: 'visible' });
            folderElements.forEach((folder, index) => {
                gsap.to(folder, {
                    opacity: 1,
                    delay: index * 0.05, // 添加延迟以实现顺序动画
                    duration: animationConfig.duration.medium, // 0.3s
                    ease: animationConfig.ease.outQuad       // "power1.out"
                });
            });
        }
    }
};

const handleMobileView = () => {
    const sidebar = document.querySelector('.sidebar');
    const isMobile = isMobileDevice();
    document.body.classList.toggle('mobile-device', isMobile);
    updateSidebarState(sidebar, isMobile);
};

const adjustHomeMessagePosition = (isCollapsed) => { 
    const homeMessage = document.querySelector('.home-message');
    const searchContainer = document.querySelector('.search-container');

    if (window.innerWidth < 768) {
        // 移动视图
        if (homeMessage) {
            homeMessage.style.left = '50%';
        }
        if (searchContainer) {
            searchContainer.style.left = '50%';
            // 确保在移动视图清除可能存在的偏移量
            searchContainer.style.removeProperty('--search-container-centering-offset');
        }
    } else {
        // 桌面视图
        if (homeMessage) {
            homeMessage.style.left = ''; // 由 CSS 控制
        }
        if (searchContainer) {
            searchContainer.style.left = ''; // 由 CSS 控制 left: 50%

            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                // 计算使 searchInput 在 searchContainer 内居中所需的偏移量
                // 这个计算假设任何使 searchInput 偏离 searchContainer 中心的额外宽度都在 searchInput 的右侧
                const searchInputOffsetLeft = searchInput.offsetLeft; // searchInput 相对于 searchContainer 的左偏移
                const searchInputWidth = searchInput.offsetWidth;
                const searchContainerWidth = searchContainer.offsetWidth;

                // shiftInPx > 0 表示 searchInput 的中心在 searchContainer 中心的左侧。
                // 因此，searchContainer 需要向右移动 shiftInPx 来使 searchInput 居中。
                const shiftInPx = (searchContainerWidth / 2) - (searchInputOffsetLeft + searchInputWidth / 2);
                
                searchContainer.style.setProperty('--search-container-centering-offset', `${shiftInPx}px`);
            } else {
                 // 如果找不到 searchInput，确保清除偏移量以防意外
                searchContainer.style.removeProperty('--search-container-centering-offset');
            }
        }
    }
};

// 在事件监听中保持调用
/** 渲染相关 */
const renderHome = () => {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="home-message">
            <div class="chinese-text">初五的书签</div>
            <div class="english-text">Chuwu's Bookmarks</div>
        </div>
    `;
    document.getElementById('breadcrumbs').innerHTML = '';
    adjustHomeMessagePosition(document.querySelector('.sidebar').classList.contains('collapsed'));

    // 优化动画性能 - 减少初始动画复杂度
    const masterTimeline = gsap.timeline();

    // 设置初始状态 - 简化初始设置
    gsap.set('.home-message', { opacity: 0 });
    gsap.set('.chinese-text', {
        opacity: 0,
        scale: 0.8,  // 从0.5改为0.8，减少变形量
        x: -50,      // 从-100改为-50，减少移动距离
        transformOrigin: "center center"
    });
    gsap.set('.english-text', {
        opacity: 0,
        scale: 0.8,  // 从0.5改为0.8
        x: -50,      // 从-100改为-50
        transformOrigin: "center center"
    });

    // 主容器淡入 - 进一步减少延迟
    masterTimeline.to('.home-message', {
        opacity: 1,
        duration: animationConfig.duration.medium,  // 从0.5减少到0.3
        ease: animationConfig.ease.outQuad  // 使用更简单的缓动函数
    });

    // 简化中文和英文文本动画 - 移除重复的动画
    masterTimeline.to('.chinese-text', {
        opacity: 1,
        scale: 1,
        x: 0,
        duration: animationConfig.duration.long,  // 从0.8减少到0.5
        ease: animationConfig.ease.outQuad
    }, "-=0.2");  // 从-0.3改为-0.2

    masterTimeline.to('.english-text', {
        opacity: 1,
        scale: 1,
        x: 0,
        duration: animationConfig.duration.long,  // 从0.8减少到0.5
        ease: animationConfig.ease.outQuad
    }, "-=0.3");  // 从-0.6改为-0.3

    // 移除重复的动画部分
    // 为中文文本的每个字符添加特殊动画效果 - 优化动画延迟
    const chineseText = document.querySelector('.chinese-text');
    const chineseChars = chineseText.textContent.split('');
    chineseText.innerHTML = '';

    chineseChars.forEach((char, index) => {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        charSpan.style.display = 'inline-block';
        charSpan.style.position = 'relative';
        chineseText.appendChild(charSpan);

        // 为每个字符添加渐显动画 - 减少延迟和持续时间
        gsap.set(charSpan, {
            opacity: 0,
            x: -10  // 从-20改为-10
        });

        gsap.to(charSpan, {
            opacity: 1,
            x: 0,
            duration: 0.2,  // 从0.3减少到0.2
            delay: 0.5 + (index * 0.05),  // 从0.8减少到0.5，从0.08减少到0.05
            ease: "power1.out"
        });

        // 为"的"字符添加从上方掉落的动画 - 减少延迟
        if (char === '的') {
            gsap.set(charSpan, {
                y: -50,  // 从-100改为-50
                opacity: 0
            });

            gsap.to(charSpan, {
                y: 0,
                opacity: 1,
                duration: 0.8,  // 从1减少到0.8
                delay: 1.2,     // 从1.8减少到1.2
                ease: "bounce.out"
            });
        }
    });

    // 为英文文本的每个字符添加特殊动画效果 - 优化动画延迟
    const englishText = document.querySelector('.english-text');
    const englishChars = englishText.textContent.split('');
    englishText.innerHTML = '';

    englishChars.forEach((char, index) => {
        const charSpan = document.createElement('span');
        charSpan.textContent = char;
        charSpan.style.display = 'inline-block';
        charSpan.style.position = 'relative';
        englishText.appendChild(charSpan);

        // 为每个字符添加渐显动画 - 减少延迟和持续时间
        gsap.set(charSpan, {
            opacity: 0,
            x: -10  // 从-20改为-10
        });

        gsap.to(charSpan, {
            opacity: 1,
            x: 0,
            duration: 0.2,  // 从0.3减少到0.2
            delay: 0.7 + (index * 0.04),  // 从1减少到0.7，从0.06减少到0.04
            ease: "power1.out"
        });

        // 为"'s"添加从上方掉落的动画 - 减少延迟
        if (char === "'") {
            gsap.set(charSpan, {
                y: -50,  // 从-100改为-50
                opacity: 0
            });

            gsap.to(charSpan, {
                y: 0,
                opacity: 1,
                duration: 0.8,  // 从1减少到0.8
                delay: 1.5,     // 从2.2减少到1.5
                ease: "bounce.out"
            });
        } else if (char === "s") {
            gsap.set(charSpan, {
                y: -50,  // 从-100改为-50
                opacity: 0
            });

            gsap.to(charSpan, {
                y: 0,
                opacity: 1,
                duration: 0.8,  // 从1减少到0.8
                delay: 1.7,     // 从2.4减少到1.7
                ease: "bounce.out"
            });
        }
    });
}



const createElement = (type, item, onClick) => {
    const element = document.createElement('div');
    element.className = type;

    if (type === 'folder') {
        element.innerHTML = `<span class="folder-icon">📁</span><span class="folder-name">${item.title}</span>`;
    } else {
        const bookmarkIcon = document.createElement('span');
        bookmarkIcon.className = 'bookmark-icon';
        bookmarkIcon.textContent = '🔗';

        if (item.icon) {
            const img = document.createElement('img');
            // 使用 lazysizes 库进行懒加载
            img.dataset.src = item.icon;
            img.alt = '🔗';
            img.classList.add('lazyload');
            
            // 添加加载事件处理
            img.addEventListener('load', function() {
                bookmarkIcon.textContent = '';
                bookmarkIcon.appendChild(img);
            });
            
            // 添加错误处理
            img.addEventListener('error', function() {
                this.remove();
            });
            
            // 先将图片添加到DOM，lazysizes会自动处理加载
            bookmarkIcon.appendChild(img);
        }

        const link = document.createElement('a');
        link.href = item.url;
        link.target = '_blank';
        link.textContent = item.title;
        element.appendChild(bookmarkIcon);
        element.appendChild(link);
    }

    if (onClick) element.addEventListener('click', onClick);
    return element;
};

const renderSidebar = (data) => {
    const sidebar = document.getElementById('sidebar-folders');
    sidebar.innerHTML = '';
    const rootFolder = data.find(item => item.title === '书签栏' || item.title === 'Bookmarks Bar');
    if (!rootFolder) return;

    // 使用DocumentFragment减少DOM操作
    const fragment = document.createDocumentFragment();

    rootFolder.children
        .filter(item => item.type === 'folder')
        .forEach(item => {
            item.parent = rootFolder;
            if (item.children) setParentReferences(item.children, item);
            const folderElement = createElement('folder', item, (e) => {
                e.stopPropagation();
                renderMainContent(item, true);
            });
            // 添加键盘可访问性
            folderElement.setAttribute('tabindex', '0');
            folderElement.setAttribute('role', 'button');
            folderElement.setAttribute('aria-label', `文件夹: ${item.title}`);
            folderElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    renderMainContent(item, true);
                }
            });
            fragment.appendChild(folderElement);
        });

    // 一次性将所有元素添加到DOM
    sidebar.appendChild(fragment);
};

const setParentReferences = (items, parent) => {
    items.forEach(item => {
        if (item.type === 'folder') {
            item.parent = parent;
            if (item.children) setParentReferences(item.children, item);
        }
    });
};

const renderMainContent = (folder, fromSidebar = false) => {
    const content = document.getElementById('content');
    const breadcrumbs = document.getElementById('breadcrumbs');
    content.innerHTML = breadcrumbs.innerHTML = '';

    if (fromSidebar && isMobileDevice()) {
        updateSidebarState(document.querySelector('.sidebar'), true);
    }

    // 使用requestAnimationFrame优化渲染
    requestAnimationFrame(() => {
        // 使用DocumentFragment减少DOM操作
        const breadcrumbFragment = document.createDocumentFragment();

        // 添加主页链接
        const homeLink = document.createElement('span');
        homeLink.className = 'breadcrumb-item';
        homeLink.textContent = '主页';
        homeLink.setAttribute('tabindex', '0'); // 添加tabindex使其可以接收键盘焦点
        homeLink.setAttribute('role', 'button'); // 添加ARIA角色
        homeLink.setAttribute('aria-label', '返回主页'); // 添加ARIA标签
        homeLink.addEventListener('click', (e) => {
            e.stopPropagation();
            renderHome();
        });
        // 添加键盘事件处理
        homeLink.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                renderHome();
            }
        });
        breadcrumbFragment.appendChild(homeLink);

        const breadcrumbPath = [];
        let current = folder;
        while (current) {
            breadcrumbPath.unshift(current);
            current = current.parent;
        }

        breadcrumbPath
            .filter(crumb => crumb.title !== '书签栏' && crumb.title !== 'Bookmarks Bar')
            .forEach((crumb, index, arr) => {
                // 添加分隔符
                breadcrumbFragment.appendChild(Object.assign(document.createElement('span'), {
                    textContent: ' > ',
                    className: 'breadcrumb-separator'
                }));

                const crumbElement = document.createElement('span');
                crumbElement.textContent = crumb.title;
                crumbElement.className = 'breadcrumb-item';
                if (crumb.parent && index < arr.length - 1) {
                    crumbElement.setAttribute('tabindex', '0'); // 添加tabindex使其可以接收键盘焦点
                    crumbElement.setAttribute('role', 'button'); // 添加ARIA角色
                    crumbElement.setAttribute('aria-label', `导航到${crumb.title}`); // 添加ARIA标签
                    crumbElement.addEventListener('click', (e) => {
                        e.stopPropagation();
                        renderMainContent(crumb, true);
                    });
                    // 添加键盘事件处理
                    crumbElement.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            renderMainContent(crumb, true);
                        }
                    });
                }
                breadcrumbFragment.appendChild(crumbElement);
            });

        // 一次性将所有面包屑元素添加到DOM
        breadcrumbs.appendChild(breadcrumbFragment);

        // 使用DocumentFragment减少DOM操作
        const contentFragment = document.createDocumentFragment();

        folder.children?.forEach((item, index) => {
            const element = createElement(
                item.type === 'folder' ? 'folder' : 'bookmark',
                item,
                item.type === 'folder' ? () => renderMainContent(item) : null
            );

            // 添加键盘可访问性
            if (item.type === 'folder') {
                element.setAttribute('tabindex', '0');
                element.setAttribute('role', 'button');
                element.setAttribute('aria-label', `文件夹: ${item.title}`);
                element.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        renderMainContent(item);
                    }
                });
            }

            // 设置动画延迟索引
            element.style.setProperty('--item-index', index);
            contentFragment.appendChild(element);
        });

        // 一次性将所有内容元素添加到DOM
        content.appendChild(contentFragment);
    });
};

/** 搜索相关 */
const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
};

const searchBookmarks = (keyword, data) => {
    const results = [];
    keyword = keyword.toLowerCase();
    const searchItems = (items) => {
        items.forEach(item => {
            if (item.title.toLowerCase().includes(keyword) ||
                (item.url && item.url.toLowerCase().includes(keyword))) {
                results.push(item);
            }
            if (item.children) searchItems(item.children);
        });
    };
    searchItems(data);
    return results;
};

const renderSearchResults = (results) => {
    const content = document.getElementById('content');
    content.innerHTML = '';
    document.getElementById('breadcrumbs').innerHTML = '';

    if (!results.length) {
        content.innerHTML = '<div class="no-results">未找到匹配的书签。</div>';
        return;
    }

    // 使用requestAnimationFrame优化渲染
    requestAnimationFrame(() => {
        // 使用DocumentFragment减少DOM操作
        const fragment = document.createDocumentFragment();
        const container = document.createElement('div');
        container.className = 'results-container';

        let itemIndex = 0;
        ['folder', 'link'].forEach(type => {
            results.filter(item => item.type === type)
                .forEach(item => {
                    const element = createElement(
                        type === 'folder' ? 'folder' : 'bookmark',
                        item,
                        type === 'folder' ? () => renderMainContent(item) : null
                    );
                    // 设置动画延迟索引
                    element.style.setProperty('--item-index', itemIndex++);
                    container.appendChild(element);
                });
        });

        fragment.appendChild(container);
        // 一次性将所有元素添加到DOM
        content.appendChild(fragment);
    });
};

// 初始化Web Worker
let searchWorker;
let dataWorker;

// 清除所有Worker缓存
const clearWorkerCaches = () => {
    if (searchWorker) {
        searchWorker.postMessage({
            action: 'clearCache'
        });
    }
    
    if (dataWorker) {
        dataWorker.postMessage({
            action: 'clearCache'
        });
    }
};

// 检查浏览器是否支持Web Worker
const initSearchWorker = () => {
    if (window.Worker) {
        // 初始化搜索Worker
        searchWorker = new Worker('assets/js/search-worker.js');

        // 监听来自搜索Worker的消息
        searchWorker.addEventListener('message', (e) => {
            const { action, results, message, fromCache } = e.data;

            switch (action) {
                case 'searchResults':
                    renderSearchResults(results);
                    if (fromCache) {
                        console.log('使用缓存的搜索结果');
                    }
                    break;
                case 'cacheCleared':
                    console.log('搜索缓存已清除');
                    break;
                case 'error':
                    console.error('搜索Worker错误:', message);
                    break;
            }
        });
        
        // 初始化数据处理Worker
        dataWorker = new Worker('assets/js/data-worker.js');
        
        // 监听来自数据Worker的消息
        dataWorker.addEventListener('message', (e) => {
            const { action, result, message, fromCache } = e.data;
            
            switch (action) {
                case 'processResult':
                case 'sortResult':
                case 'filterResult':
                    if (fromCache) {
                        console.log(`使用缓存的${action}结果`);
                    }
                    break;
                case 'cacheCleared':
                    console.log('数据处理缓存已清除');
                    break;
                case 'error':
                    console.error('数据处理Worker错误:', message);
                    break;
            }
        });
    }
};

const debounceSearch = debounce((event) => {
    const keyword = event.target.value.trim();
    if (!keyword) return renderHome();
    
    // 显示加载指示器
    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="loading-indicator" style="text-align:center; margin-top:50px; color:var(--text-color)">
            <h2>正在搜索...</h2>
            <div class="loading-spinner"></div>
        </div>
    `;

    const data = JSON.parse(localStorage.getItem('bookmarksData') || '[]');

    // 如果支持Web Worker，则使用Worker执行搜索
    if (searchWorker) {
        searchWorker.postMessage({
            action: 'search',
            data: {
                keyword: keyword,
                bookmarks: data,
                useCache: true // 明确指定使用缓存
            }
        });
    } else {
        // 降级处理：如果不支持Web Worker，则在主线程中执行搜索
        renderSearchResults(searchBookmarks(keyword, data));
    }
}, 500);

/** 初始化和事件监听 */
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化主题和移动视图
    initTheme();
    initFocusManagement();
    handleMobileView();

    // 初始化搜索Web Worker
    initSearchWorker();
    
    // 添加加载状态指示器
    const showLoadingIndicator = () => {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="loading-indicator" style="text-align:center; margin-top:50px; color:var(--text-color)">
                <h2>正在加载书签数据...</h2>
                <div class="loading-spinner"></div>
            </div>
        `;
    };
    
    // 显示加载指示器
    showLoadingIndicator();

    try {
        // 使用requestAnimationFrame优化初始化流程
        requestAnimationFrame(async () => {
            try {
                // 首先尝试从localStorage获取缓存数据进行快速渲染
                const cachedData = localStorage.getItem('bookmarksData');
                let data;
                
                if (cachedData) {
                    // 使用缓存数据进行初始渲染
                    data = JSON.parse(cachedData);
                    // 先渲染侧边栏和主页，提高用户体验
                    renderSidebar(data);
                    renderHome();
                }
                
                // 无论是否有缓存，都异步加载最新数据
                const response = await fetch('bookmarks.json');
                if (!response.ok) {
                    console.error(`加载书签文件失败: ${response.status} ${response.statusText}`);
                    // 尝试使用备用路径
                    const backupResponse = await fetch('./bookmarks.json');
                    if (!backupResponse.ok) {
                        // 如果已经有缓存数据，则继续使用
                        if (!cachedData) {
                            throw new Error(`无法加载书签文件，请确保 bookmarks.json 存在于正确位置`);
                        }
                    } else {
                        // 使用备用路径获取的数据
                        data = await backupResponse.json();
                        localStorage.setItem('bookmarksData', JSON.stringify(data));
                        // 如果之前没有缓存数据，则现在渲染
                        if (!cachedData) {
                            renderSidebar(data);
                            renderHome();
                        } else {
                            // 清除Worker缓存并使用新数据更新视图
                            clearWorkerCaches();
                            // 只在数据有变化时更新视图
                            if (JSON.stringify(data) !== cachedData) {
                                renderSidebar(data);
                                renderHome();
                            }
                        }
                    }
                } else {
                    // 使用主路径获取的数据
                    data = await response.json();
                    localStorage.setItem('bookmarksData', JSON.stringify(data));
                    // 如果之前没有缓存数据，则现在渲染
                    if (!cachedData) {
                        renderSidebar(data);
                        renderHome();
                    } else {
                        // 清除Worker缓存并使用新数据更新视图
                        clearWorkerCaches();
                        // 只在数据有变化时更新视图
                        if (JSON.stringify(data) !== cachedData) {
                            renderSidebar(data);
                            renderHome();
                        }
                    }
                }
            } catch (error) {
                console.error('书签加载错误:', error);
                // 显示错误信息给用户
                document.getElementById('content').innerHTML = `
                    <div class="error-message" style="text-align:center; margin-top:50px; color:var(--text-color)">
                        <h2>加载书签数据失败</h2>
                        <p>请确保 bookmarks.json 文件存在且格式正确</p>
                        <p>错误详情: ${error.message}</p>
                    </div>
                `;
            }
        });
    } catch (error) {
        console.error('初始化错误:', error);
    }

    // 使用事件委托减少事件监听器数量
    const sidebar = document.querySelector('.sidebar');
    const toggleSidebar = document.getElementById('toggle-sidebar');
    toggleSidebar.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateSidebarState(sidebar, !sidebar.classList.contains('collapsed'));
    });
    toggleSidebar.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            updateSidebarState(sidebar, !sidebar.classList.contains('collapsed'));
        }
    });

    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', toggleTheme);
    themeToggle.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleTheme();
        }
    });

    document.getElementById('search-input').addEventListener('keyup', debounceSearch);

    // 主页按钮键盘事件
    const homeButton = document.querySelector('.home-button');
    if (homeButton) {
        homeButton.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                renderHome();
            }
        });
    }

    // 初始化背景图片懒加载
    const lazyLoadBackgroundImage = () => {
        // 创建一个新的Image对象预加载背景GIF
        const bgImage = new Image();
        bgImage.src = 'assets/images/moecat.gif';
        bgImage.onload = () => {
            // 图片加载完成后，添加类以显示背景
            document.body.classList.add('bg-loaded');
        };
    };

    // 延迟加载背景图片，优先加载关键内容
    setTimeout(lazyLoadBackgroundImage, 100);
});

// 简化 FastClick 初始化，避免嵌套的事件监听器
document.addEventListener('DOMContentLoaded', function () {
    if (typeof FastClick !== 'undefined') {
        FastClick.attach(document.body);
    }

    // 添加Ctrl+K快捷键聚焦搜索框功能
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            document.getElementById('search-input').focus();
        }
    });
    window.addEventListener('resize', () => {
        handleMobileView();
        adjustHomeMessagePosition(document.querySelector('.sidebar').classList.contains('collapsed'));
    });
});

// 标题变更功能
const originalTitle = document.title;
const newTitle = "你要离开我了吗ヽ(*。>Д<)o゜";

// 鼠标离开页面时触发的事件
document.addEventListener('mouseout', function (e) {
    // 仅当鼠标离开窗口时进行处理
    if (e.relatedTarget === null) {
        document.title = newTitle;
    }
});

// 鼠标回到页面时触发的事件
document.addEventListener('mouseover', function () {
    document.title = originalTitle;
});

/** 键盘导航系统 */
const initKeyboardNavigation = (direction, e) => {
    // 定义可聚焦元素的选择器
    const focusableSelectors = [
        '.home-button',                // 主页按钮
        '#toggle-sidebar',             // 侧边栏切换按钮
        '#theme-toggle',               // 主题切换按钮
        '.sidebar .folder',            // 侧边栏文件夹
        '.breadcrumb-item',            // 面包屑导航项
        '#content .folder',            // 内容区域文件夹
        '#content .bookmark a'         // 内容区域书签链接
    ];

    // 设置搜索框的tabindex为-1，使其在Tab键导航序列中被跳过
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.setAttribute('tabindex', '-1');
    }

    // 添加Ctrl+K快捷键功能，按下该组合键可以直接聚焦到搜索框
    document.addEventListener('keydown', (e) => {
        // 检测Ctrl+K组合键
        if (e.ctrlKey && e.key === 'k') {
            if (e) e.preventDefault(); // 阻止默认行为
            if (searchInput) {
                searchInput.focus();
            }
        }
    });

    // 获取所有可聚焦元素
    const getFocusableElements = () => {
        return Array.from(document.querySelectorAll(focusableSelectors.join(',')));
    };

    // 获取当前聚焦元素的索引
    const getCurrentFocusIndex = (elements) => {
        const activeElement = document.activeElement;
        return elements.findIndex(el => el === activeElement);
    };

    // 获取元素的区域类型
    const getElementRegion = (element) => {
        if (!element) return null;

        if (element.closest('.sidebar')) return 'sidebar';
        if (element.closest('#breadcrumbs')) return 'breadcrumbs';
        if (element.closest('#content')) return 'content';
        if (element.id === 'search-input') return 'search';
        if (element.id === 'theme-toggle') return 'theme';
        if (element.id === 'toggle-sidebar' || element.classList.contains('home-button')) return 'controls';

        return null;
    };

    // 根据方向和当前位置获取下一个要聚焦的元素
    const getNextFocusElement = (direction, currentIndex, elements) => {
        const currentElement = elements[currentIndex];
        const currentRegion = getElementRegion(currentElement);

        // 如果当前没有聚焦元素，默认聚焦主页按钮
        if (currentIndex === -1) {
            return elements.find(el => el.classList.contains('home-button')) || elements[0];
        }

        // 根据方向和区域确定下一个聚焦元素
        switch (direction) {
            case 'right': {
                // 从左到右的导航逻辑
                if (currentRegion === 'sidebar') {
                    // 从侧边栏移动到内容区域
                    return elements.find(el => getElementRegion(el) === 'content') ||
                        elements[currentIndex + 1] || elements[0];
                } else if (currentRegion === 'theme') {
                    // 从主题按钮移动到内容区域
                    return elements.find(el => getElementRegion(el) === 'content') || elements[currentIndex + 1] || elements[0];
                } else if (currentRegion === 'breadcrumbs') {
                    // 从面包屑移动到内容区域
                    return elements.find(el => getElementRegion(el) === 'content') || elements[currentIndex + 1] || elements[0];
                } else {
                    // 默认向右移动一个元素
                    return elements[currentIndex + 1] || elements[0];
                }
            }
            case 'left': {
                // 从右到左的导航逻辑
                if (currentRegion === 'content') {
                    // 从内容区域移动到侧边栏或面包屑
                    const breadcrumbElement = elements.find(el => getElementRegion(el) === 'breadcrumbs');
                    const sidebarElement = elements.find(el => getElementRegion(el) === 'sidebar');
                    return breadcrumbElement || sidebarElement || elements[currentIndex - 1] || elements[elements.length - 1];
                } else if (currentRegion === 'theme') {
                    // 从主题按钮移动到侧边栏
                    return elements.find(el => getElementRegion(el) === 'sidebar') || elements[currentIndex - 1] || elements[elements.length - 1];
                } else {
                    // 默认向左移动一个元素
                    return elements[currentIndex - 1] || elements[elements.length - 1];
                }
            }
            case 'up': {
                // 向上导航逻辑
                const sameRegionElements = elements.filter(el => getElementRegion(el) === currentRegion);
                const currentRegionIndex = sameRegionElements.findIndex(el => el === currentElement);

                if (currentRegionIndex > 0) {
                    // 同一区域内向上移动
                    return sameRegionElements[currentRegionIndex - 1];
                } else {
                    // 跨区域向上移动
                    if (currentRegion === 'content') {
                        // 从内容区域移动到面包屑
                        return elements.find(el => getElementRegion(el) === 'breadcrumbs') ||
                            elements.find(el => el.classList.contains('home-button')) ||
                            elements[currentIndex - 1] || elements[elements.length - 1];
                    } else if (currentRegion === 'breadcrumbs') {
                        // 从面包屑移动到主页按钮
                        return elements.find(el => el.classList.contains('home-button')) || elements[currentIndex - 1] || elements[elements.length - 1];
                    } else {
                        // 默认向上移动到上一个元素
                        return elements[currentIndex - 1] || elements[elements.length - 1];
                    }
                }
            }
            case 'down': {
                // 向下导航逻辑
                const sameRegionElements = elements.filter(el => getElementRegion(el) === currentRegion);
                const currentRegionIndex = sameRegionElements.findIndex(el => el === currentElement);

                if (currentRegionIndex < sameRegionElements.length - 1) {
                    // 同一区域内向下移动
                    return sameRegionElements[currentRegionIndex + 1];
                } else {
                    // 跨区域向下移动
                    if (currentRegion === 'theme' || currentRegion === 'controls') {
                        // 从顶部控件移动到面包屑或内容区域
                        return elements.find(el => getElementRegion(el) === 'breadcrumbs') ||
                            elements.find(el => getElementRegion(el) === 'content') ||
                            elements[currentIndex + 1] || elements[0];
                    } else if (currentRegion === 'breadcrumbs') {
                        // 从面包屑移动到内容区域
                        return elements.find(el => getElementRegion(el) === 'content') || elements[currentIndex + 1] || elements[0];
                    } else {
                        // 默认向下移动到下一个元素
                        return elements[currentIndex + 1] || elements[0];
                    }
                }
            }
            default:
                return elements[currentIndex];
        }
    };

    if (e) e.preventDefault(); // 阻止默认行为

    const focusableElements = getFocusableElements();
    const currentIndex = getCurrentFocusIndex(focusableElements);
    const nextElement = getNextFocusElement(direction, currentIndex, focusableElements);

    if (nextElement) {
        nextElement.focus();

        // 如果是侧边栏折叠状态且聚焦到侧边栏元素，自动展开侧边栏
        const sidebar = document.querySelector('.sidebar');
        if (sidebar.classList.contains('collapsed') && getElementRegion(nextElement) === 'sidebar') {
            updateSidebarState(sidebar, false);
        }

        // 滚动到可见区域
        nextElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
};


// 在DOM加载完成后初始化键盘导航
document.addEventListener('DOMContentLoaded', function () {
    // 添加键盘导航事件监听
    document.addEventListener('keydown', function (e) {
        // 方向键导航
        if (e.key === 'ArrowUp') {
            initKeyboardNavigation('up', e);
        } else if (e.key === 'ArrowDown') {
            initKeyboardNavigation('down', e);
        } else if (e.key === 'ArrowLeft') {
            initKeyboardNavigation('left', e);
        } else if (e.key === 'ArrowRight') {
            initKeyboardNavigation('right', e);
        }
    });
});