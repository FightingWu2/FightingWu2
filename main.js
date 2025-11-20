// main.js
// 页面导航与内容加载、markdown渲染、运动记录、图片放大、返回功能等

// 页面栈用于返回功能
let pageStack = [];

// 检测是否在主页面（有 #main-content 元素）
function isMainPage() {
    return document.getElementById('main-content') !== null;
}

// 动态加载页面内容
function loadPage(page, options = {}) {
    // 如果不在主页面，直接跳转
    if (!isMainPage()) {
        window.location.href = page;
        return;
    }
    
    // 在主页面中，使用动态加载
    pageStack.push(() => loadPage(page, options));
    animateMainContent(() => {
        fetch(page)
            .then(res => res.text())
            .then(html => {
                const mainContent = document.getElementById('main-content');
                mainContent.innerHTML = html;
                
                // 重新执行子页面中的脚本
                const scripts = mainContent.querySelectorAll('script');
                scripts.forEach(oldScript => {
                    const newScript = document.createElement('script');
                    // 复制所有属性
                    Array.from(oldScript.attributes).forEach(attr => {
                        newScript.setAttribute(attr.name, attr.value);
                    });
                    if (oldScript.src) {
                        newScript.src = oldScript.src;
                    } else {
                        newScript.textContent = oldScript.textContent;
                    }
                    // 移除旧脚本并添加新脚本
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                });
                
                // goBack函数已在全局定义，不需要重新定义
                
                if (options.onLoad) options.onLoad();
            })
            .catch(err => {
                console.error('Failed to load page:', err);
                // 如果加载失败，尝试直接跳转
                window.location.href = page;
            });
    });
}

// 动画切换主内容
function animateMainContent(callback) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) {
        callback();
        return;
    }
    mainContent.style.opacity = '1';
    mainContent.style.transform = 'scale(1)';
    mainContent.style.transition = 'opacity 0.4s, transform 0.4s';
    mainContent.style.opacity = '0';
    mainContent.style.transform = 'scale(0.98)';
    setTimeout(() => {
        callback();
        mainContent.style.opacity = '0';
        mainContent.style.transform = 'scale(1.02)';
        setTimeout(() => {
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'scale(1)';
        }, 60);
    }, 300);
}

// 统一的返回上一页函数
function goBack() {
    // 如果是在主页面中（通过loadPage加载的页面）
    if (isMainPage() && pageStack.length > 1) {
        pageStack.pop(); // 当前页
        const prev = pageStack.pop();
        if (prev && typeof prev === 'function') {
            prev();
        } else {
            // 如果栈中没有有效函数，返回首页
            window.location.href = 'index.html';
        }
    } else {
        // 独立HTML页面，使用浏览器历史记录
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // 无历史记录，根据当前页面路径判断返回位置
            const currentPath = window.location.pathname;
            if (currentPath.includes('pages/')) {
                // 如果是pages目录下的页面，返回上级目录的index.html或对应列表页
                const pageName = currentPath.split('/').pop();
                
                // 根据页面类型返回对应的列表页
                if (pageName.includes('sport')) {
                    window.location.href = 'sport.html';
                } else if (pageName.includes('book')) {
                    window.location.href = 'books.html';
                } else if (pageName.includes('code')) {
                    window.location.href = 'code.html';
                } else if (pageName.includes('writing')) {
                    window.location.href = 'writing.html';
                } else if (pageName.includes('art')) {
                    window.location.href = 'art.html';
                } else {
                    // 默认返回首页
                    window.location.href = '../index.html';
                }
            } else {
                // 默认返回首页
                window.location.href = 'index.html';
            }
        }
    }
}

// 渲染返回按钮
function renderBackButton() {
    return `<button onclick="goBack()" class="back-btn"><i class="fa fa-arrow-left"></i></button>`;
}

// markdown渲染（使用marked.js CDN）
function renderMarkdown(md, container) {
    if (!window.marked) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
        script.onload = () => {
            container.innerHTML = '<div class="markdown-body">' + marked.parse(md) + '</div>';
        };
        document.body.appendChild(script);
    } else {
        container.innerHTML = '<div class="markdown-body">' + marked.parse(md) + '</div>';
    }
}

// 图片放大
function showPhotoModal(src, title) {
    const modal = document.createElement('div');
    modal.className = 'photo-modal';
    modal.innerHTML = `
        <button class="close-btn" title="关闭" onclick="this.parentNode.remove()">×</button>
        <img src="${src}" alt="photo">
        <div class="photo-title">${title}</div>
    `;
    document.body.appendChild(modal);
}

// Sport记录（本地存储）
function addSportRecord(type, date, duration, note) {
    const key = 'sport_' + type;
    const records = JSON.parse(localStorage.getItem(key) || '[]');
    records.push({date, duration, note});
    localStorage.setItem(key, JSON.stringify(records));
}
function getSportRecords(type) {
    const key = 'sport_' + type;
    return JSON.parse(localStorage.getItem(key) || '[]');
}

// 主页导航事件
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('site-title').onclick = () => loadPage('pages/about.html');
    document.getElementById('nav-code').onclick = () => loadPage('pages/code.html');
    document.getElementById('nav-sport').onclick = () => loadPage('pages/sport.html');
    document.getElementById('nav-art').onclick = () => loadPage('pages/art.html');
    document.getElementById('nav-reading').onclick = () => loadPage('pages/books.html');
    document.getElementById('nav-writing').onclick = () => loadPage('pages/writing.html');
});

// 供子页面调用的全局方法
window.renderBackButton = renderBackButton;
window.renderMarkdown = renderMarkdown;
window.showPhotoModal = showPhotoModal;
window.addSportRecord = addSportRecord;
window.getSportRecords = getSportRecords;
window.goBack = goBack;
