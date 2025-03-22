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

// 芝加哥艺术学院 API 配置
const AIC_API_URL = 'https://api.artic.edu/api/v1';
const AIC_IMAGE_URL = 'https://www.artic.edu/iiif/2';

// 著名摄影师列表
const PHOTOGRAPHERS = [
    'Alfred Stieglitz',
    'Man Ray',
    'László Moholy-Nagy',
    'Walker Evans',
    'Henri Cartier-Bresson',
    'Dorothea Lange',
    'Edward Steichen',
    'Edward Weston',
    'Berenice Abbott',
    'Margaret Bourke-White'
];

// 摄影师简介
const PHOTOGRAPHER_BIOS = {
    'Alfred Stieglitz': '阿尔弗雷德·斯蒂格利茨（1864-1946），美国摄影大师，现代摄影的先驱者之一，致力于将摄影提升为一门艺术。',
    'Man Ray': '曼·雷（1890-1976），超现实主义摄影的代表人物，以实验性的摄影技术闻名。',
    'László Moholy-Nagy': '拉斯洛·莫霍利-纳吉（1895-1946），包豪斯学院教师，实验性摄影和光影艺术的先驱。',
    'Walker Evans': '沃克·伊文思（1903-1975），美国纪实摄影大师，以记录大萧条时期的美国生活著称。',
    'Henri Cartier-Bresson': '亨利·卡蒂埃·布列松（1908-2004），法国摄影大师，"决定性瞬间"理论的创立者。',
    'Dorothea Lange': '多萝西娅·兰格（1895-1965），美国纪实摄影先驱，以记录大萧条时期的人文影像闻名。',
    'Edward Steichen': '爱德华·斯泰肯（1879-1973），卢森堡裔美国摄影师，现代摄影艺术的重要推动者。',
    'Edward Weston': '爱德华·韦斯顿（1886-1958），美国摄影大师，以静物和风光摄影闻名。',
    'Berenice Abbott': '贝勒尼斯·阿博特（1898-1991），美国摄影师，以记录纽约城市变迁著称。',
    'Margaret Bourke-White': '玛格丽特·伯克-怀特（1904-1971），美国女摄影师，《生活》杂志首位女摄影师。'
};

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
        
        // 随机选择一个摄影师
        const randomPhotographer = PHOTOGRAPHERS[Math.floor(Math.random() * PHOTOGRAPHERS.length)];
        
        // 搜索摄影作品
        const searchUrl = `${AIC_API_URL}/artworks/search?q=${encodeURIComponent(randomPhotographer)}&fields=id,title,image_id,date_display,artist_display,medium_display,dimensions,credit_line,description,place_of_origin,artwork_type_title,department_title&limit=100`;
        console.log('搜索URL:', searchUrl);
        
        const response = await fetch(searchUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const searchData = await response.json();
        
        if (!searchData.data || searchData.data.length === 0) {
            throw new Error('没有找到摄影作品');
        }

        // 过滤出有图片的作品
        const artworksWithImages = searchData.data.filter(artwork => artwork.image_id);
        
        if (artworksWithImages.length === 0) {
            throw new Error('没有找到带图片的作品');
        }

        // 随机选择一个作品
        const artwork = artworksWithImages[Math.floor(Math.random() * artworksWithImages.length)];
        
        // 构建图片URL
        const imageUrl = `${AIC_IMAGE_URL}/${artwork.image_id}/full/843,/0/default.jpg`;

        // 构建描述
        let description = [];
        if (artwork.description) description.push(artwork.description);
        if (artwork.place_of_origin) description.push(`创作地点：${artwork.place_of_origin}`);
        if (artwork.date_display) description.push(`创作时间：${artwork.date_display}`);

        // 提取艺术家姓名
        const artistName = artwork.artist_display ? artwork.artist_display.split('\n')[0] : randomPhotographer;

        const result = {
            title: artwork.title || "历史摄影作品",
            imageUrl: imageUrl,
            photographer: {
                name: artistName,
                avatar: "https://www.artic.edu/iiif/2/25c31d8d-21a4-9ea1-1d73-6dff13cd3c0e/full/200,/0/default.jpg",
                bio: PHOTOGRAPHER_BIOS[randomPhotographer] || "20世纪重要摄影艺术家"
            },
            description: description.join('\n') || "这是一张来自芝加哥艺术学院馆藏的历史摄影作品。",
            technicalInfo: [
                artwork.artwork_type_title ? `类型: ${artwork.artwork_type_title}` : null,
                artwork.medium_display ? `工艺: ${artwork.medium_display}` : null,
                artwork.dimensions ? `尺寸: ${artwork.dimensions}` : null,
                artwork.department_title ? `收藏部门: ${artwork.department_title}` : null,
                artwork.credit_line ? `来源: ${artwork.credit_line}` : null
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
