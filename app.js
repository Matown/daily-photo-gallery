// 初始化空的照片数据结构
const photoData = {
    title: "",
    imageUrl: "",
    photographer: {
        name: "",
        avatar: "",
        bio: ""
    },
    description: "",
    technicalInfo: []
};

// 大都会艺术博物馆 API 配置
const MET_API_URL = 'https://collectionapi.metmuseum.org/public/collection/v1';

// 摄影作品关键词
const PHOTO_KEYWORDS = [
    'photograph',
    'daguerreotype',
    'camera work',
    'gelatin silver print',
    'photogravure'
];

// 显示加载动画
function showLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

// 隐藏加载动画
function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

async function fetchDailyPhoto() {
    try {
        showLoading();
        console.log('开始获取每日照片...');
        
        // 随机选择一个关键词
        const randomKeyword = PHOTO_KEYWORDS[Math.floor(Math.random() * PHOTO_KEYWORDS.length)];
        
        // 搜索摄影作品
        const searchUrl = `${MET_API_URL}/search?q=${randomKeyword}&hasImages=true&medium=Photographs`;
        console.log('搜索URL:', searchUrl);
        
        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        
        if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
            throw new Error('没有找到摄影作品');
        }
        
        console.log(`找到 ${searchData.objectIDs.length} 个作品`);
        
        // 随机选择一个作品ID
        const randomIndex = Math.floor(Math.random() * searchData.objectIDs.length);
        const objectID = searchData.objectIDs[randomIndex];
        
        // 获取作品详细信息
        const objectUrl = `${MET_API_URL}/objects/${objectID}`;
        console.log('作品详情URL:', objectUrl);
        
        const objectResponse = await fetch(objectUrl);
        const objectData = await objectResponse.json();
        
        if (!objectData.primaryImage) {
            throw new Error('作品没有可用的图片');
        }

        // 处理拍摄年代
        let period = '';
        if (objectData.period) {
            period = objectData.period;
        } else if (objectData.objectDate) {
            period = objectData.objectDate;
        } else if (objectData.objectBeginDate && objectData.objectEndDate) {
            if (objectData.objectBeginDate === objectData.objectEndDate) {
                period = `${objectData.objectBeginDate}年`;
            } else {
                period = `${objectData.objectBeginDate}-${objectData.objectEndDate}年`;
            }
        }

        // 构建摄影师信息
        let photographerName = '佚名';
        let photographerBio = '';
        
        if (objectData.artistDisplayName) {
            photographerName = objectData.artistDisplayName;
            
            const bioElements = [
                objectData.artistDisplayBio,
                objectData.artistNationality,
                objectData.artistBeginDate && objectData.artistEndDate ? 
                    `(${objectData.artistBeginDate}-${objectData.artistEndDate})` : null
            ].filter(Boolean);
            
            photographerBio = bioElements.join('，') || '历史摄影作品作者';
        }

        // 构建描述
        let description = [];
        if (objectData.description) description.push(objectData.description);
        if (objectData.culture) description.push(`文化背景：${objectData.culture}`);
        if (period) description.push(`创作年代：${period}`);
        if (objectData.repository) description.push(`收藏地点：${objectData.repository}`);

        const result = {
            title: objectData.title || "历史摄影作品",
            imageUrl: objectData.primaryImage,
            photographer: {
                name: photographerName,
                avatar: "https://images.metmuseum.org/CRDImages/ep/original/DP-14939-001.jpg",
                bio: photographerBio
            },
            description: description.join('\n') || "这是一张来自大都会艺术博物馆馆藏的历史摄影作品。",
            technicalInfo: [
                objectData.medium ? `工艺: ${objectData.medium}` : null,
                objectData.dimensions ? `尺寸: ${objectData.dimensions}` : null,
                objectData.classification ? `分类: ${objectData.classification}` : null,
                objectData.department ? `收藏部门: ${objectData.department}` : null,
                objectData.creditLine ? `来源: ${objectData.creditLine}` : null
            ].filter(Boolean)
        };

        console.log('处理完成，返回结果:', result);
        return result;
    } catch (error) {
        console.error('获取图片失败:', error);
        return {
            title: "暂时无法加载图片",
            imageUrl: "https://via.placeholder.com/800x600?text=暂时无法加载图片",
            photographer: {
                name: "系统提示",
                avatar: "https://via.placeholder.com/80x80?text=头像",
                bio: "请稍后再试"
            },
            description: `抱歉，获取图片时遇到问题：${error.message}`,
            technicalInfo: []
        };
    } finally {
        hideLoading();
    }
}

// 每24小时更新一次图片
async function initializeAndScheduleUpdates() {
    try {
        console.log('开始初始化...');
        // 首次加载
        const newPhotoData = await fetchDailyPhoto();
        if (newPhotoData) {
            console.log('获取到新数据，更新页面...');
            Object.assign(photoData, newPhotoData);
            updatePageContent();
        }

        // 设置定时更新
        console.log('设置定时更新...');
        setInterval(async () => {
            try {
                console.log('执行定时更新...');
                const newPhotoData = await fetchDailyPhoto();
                if (newPhotoData) {
                    console.log('获取到新数据，更新页面...');
                    Object.assign(photoData, newPhotoData);
                    updatePageContent();
                }
            } catch (error) {
                console.error('定时更新失败:', error);
            }
        }, 24 * 60 * 60 * 1000); // 24小时
    } catch (error) {
        console.error('初始化失败:', error);
    }
}

// 更新页面内容
function updatePageContent() {
    try {
        console.log('开始更新页面内容...');
        // 更新日期
        const currentDate = new Date();
        document.getElementById('current-date').textContent = currentDate.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // 更新照片信息
        const dailyPhoto = document.getElementById('daily-photo');
        console.log('设置图片URL:', photoData.imageUrl);
        dailyPhoto.src = photoData.imageUrl;
        dailyPhoto.alt = photoData.title;
        
        document.getElementById('photo-title').textContent = photoData.title;
        
        const photographerAvatar = document.getElementById('photographer-avatar');
        photographerAvatar.src = photoData.photographer.avatar;
        photographerAvatar.alt = photoData.photographer.name;
        
        document.getElementById('photographer-name').textContent = photoData.photographer.name;
        document.getElementById('photographer-bio').textContent = photoData.photographer.bio;
        document.getElementById('photo-description').textContent = photoData.description;

        // 更新技术参数
        const technicalList = document.getElementById('technical-info');
        technicalList.innerHTML = photoData.technicalInfo
            .map(info => `<li>${info}</li>`)
            .join('');
            
        console.log('页面更新完成');
    } catch (error) {
        console.error('更新页面内容失败:', error);
    }
}

// 页面加载完成后的处理
document.addEventListener('DOMContentLoaded', async () => {
    console.log('页面加载完成，开始初始化...');
    try {
        const newPhotoData = await fetchDailyPhoto();
        if (newPhotoData) {
            Object.assign(photoData, newPhotoData);
            updatePageContent();
        }
    } catch (error) {
        console.error('初始化失败:', error);
    }
});

// 添加图片加载错误处理
document.getElementById('daily-photo').addEventListener('error', function(e) {
    console.error('图片加载失败:', e);
    this.src = 'https://via.placeholder.com/800x600?text=图片加载失败';
});

document.getElementById('photographer-avatar').addEventListener('error', function(e) {
    console.error('头像加载失败:', e);
    this.src = 'https://via.placeholder.com/80x80?text=头像';
}); 
