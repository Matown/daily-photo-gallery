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

// Wikimedia Commons API 配置
const WIKI_API_URL = 'https://commons.wikimedia.org/w/api.php';

// 历史摄影作品集合
const PHOTO_CATEGORIES = [
    'Category:Photographs_by_Ansel_Adams',
    'Category:Photographs_by_Dorothea_Lange',
    'Category:Photographs_by_Walker_Evans',
    'Category:Photographs_by_Henri_Cartier-Bresson',
    'Category:Historical_photographs_of_China',
    'Category:Black-and-white_photographs',
    'Category:Street_photography',
    'Category:Portrait_photographs',
    'Category:Landscape_photographs'
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
        
        // 随机选择一个摄影作品分类
        const randomCategory = PHOTO_CATEGORIES[Math.floor(Math.random() * PHOTO_CATEGORIES.length)];
        
        // 第一步：获取分类中的图片
        const categoryUrl = `${WIKI_API_URL}?action=query&list=categorymembers&cmtype=file&cmtitle=${randomCategory}&format=json&origin=*&cmlimit=50`;
        console.log('分类搜索URL:', categoryUrl);
        
        const categoryResponse = await fetch(categoryUrl);
        const categoryData = await categoryResponse.json();
        
        if (!categoryData.query || !categoryData.query.categorymembers || categoryData.query.categorymembers.length === 0) {
            throw new Error('没有找到摄影作品');
        }
        
        // 随机选择一张图片
        const randomImage = categoryData.query.categorymembers[Math.floor(Math.random() * categoryData.query.categorymembers.length)];
        
        // 第二步：获取图片详细信息
        const imageInfoUrl = `${WIKI_API_URL}?action=query&titles=${encodeURIComponent(randomImage.title)}&prop=imageinfo|categories&iiprop=url|extmetadata|dimensions&format=json&origin=*`;
        console.log('图片信息URL:', imageInfoUrl);
        
        const imageResponse = await fetch(imageInfoUrl);
        const imageData = await imageResponse.json();
        
        const pages = imageData.query.pages;
        const pageId = Object.keys(pages)[0];
        const imageInfo = pages[pageId].imageinfo[0];
        
        if (!imageInfo || !imageInfo.url) {
            throw new Error('无法获取图片信息');
        }

        // 解析元数据
        const metadata = imageInfo.extmetadata || {};
        
        // 获取摄影师信息
        let photographerName = '佚名';
        let photographerBio = '';
        
        if (metadata.Artist) {
            photographerName = metadata.Artist.value.replace(/<[^>]*>/g, '');
        }
        
        // 根据分类设置摄影师介绍
        const photographerIntros = {
            'Ansel Adams': '安塞尔·亚当斯，美国摄影大师，以黑白风光摄影闻名于世。',
            'Dorothea Lange': '多萝西娅·兰格，美国纪实摄影先驱，记录了大萧条时期的人文影像。',
            'Walker Evans': '沃克·伊文思，美国摄影师，以记录美国乡村生活著称。',
            'Henri Cartier-Bresson': '亨利·卡蒂埃·布列松，法国摄影大师，"决定性瞬间"理论的创立者。'
        };
        
        for (const [name, bio] of Object.entries(photographerIntros)) {
            if (photographerName.includes(name)) {
                photographerBio = bio;
                break;
            }
        }
        
        if (!photographerBio) {
            photographerBio = '这位摄影师的作品被收录在维基共享资源中';
        }

        // 清理HTML标签
        const cleanHtml = (str) => str ? str.replace(/<[^>]*>/g, '') : '';

        const result = {
            title: metadata.ObjectName ? cleanHtml(metadata.ObjectName.value) : randomImage.title.split(':').pop(),
            imageUrl: imageInfo.url,
            photographer: {
                name: photographerName,
                avatar: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Wikimedia_Commons_camera_icon.svg/128px-Wikimedia_Commons_camera_icon.svg.png",
                bio: photographerBio
            },
            description: metadata.ImageDescription ? cleanHtml(metadata.ImageDescription.value) : "这是一张历史摄影作品",
            technicalInfo: [
                metadata.DateTimeOriginal ? `拍摄时间: ${cleanHtml(metadata.DateTimeOriginal.value)}` : null,
                imageInfo.width && imageInfo.height ? `尺寸: ${imageInfo.width} x ${imageInfo.height}` : null,
                metadata.Credit ? `来源: ${cleanHtml(metadata.Credit.value)}` : null,
                metadata.License ? `许可: ${cleanHtml(metadata.License.value)}` : null
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
