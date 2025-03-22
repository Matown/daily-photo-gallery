// 配置
const config = {
    // Unsplash API key
    UNSPLASH_API_KEY: 'TG47-Cb7r9fA5e-Zhxdwr7YgeFJRzJpKAvE8hJxxcog'
};

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

async function fetchDailyPhoto() {
    try {
        // 首先获取所有摄影作品的ID列表
        const response = await fetch('https://collectionapi.metmuseum.org/public/collection/v1/search?q=photograph&hasImages=true&medium=Photographs');
        const data = await response.json();
        
        // 随机选择一个作品ID
        const randomIndex = Math.floor(Math.random() * data.total);
        const objectID = data.objectIDs[randomIndex];
        
        // 获取作品详细信息
        const objectResponse = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`);
        const objectData = await objectResponse.json();
        
        // 构建图片分析描述
        let photoAnalysis = "";
        if (objectData.period) {
            photoAnalysis += `这张照片拍摄于${objectData.period}时期。`;
        }
        if (objectData.culture) {
            photoAnalysis += `体现了${objectData.culture}的文化特色。`;
        }
        if (objectData.medium) {
            photoAnalysis += `使用${objectData.medium}摄影工艺。`;
        }
        
        // 添加关于照片的历史背景
        if (objectData.creditLine) {
            photoAnalysis += objectData.creditLine + '。';
        }

        return {
            title: objectData.title || "历史摄影作品",
            imageUrl: objectData.primaryImage,
            photographer: {
                name: objectData.artistDisplayName || "佚名",
                avatar: "https://www.metmuseum.org/-/media/images/about-the-met/policies-and-documents/open-access/open-access-logo.png",
                bio: objectData.artistDisplayBio || `${objectData.period || ''}摄影师`
            },
            description: photoAnalysis,
            technicalInfo: [
                objectData.dimensions ? `尺寸: ${objectData.dimensions}` : null,
                objectData.classification ? `类型: ${objectData.classification}` : null,
                objectData.department ? `收藏部门: ${objectData.department}` : null,
                objectData.accessionYear ? `收藏年份: ${objectData.accessionYear}` : null
            ].filter(Boolean)
        };
    } catch (error) {
        console.error('获取图片失败:', error);
        return null;
    }
}

// 每24小时更新一次图片
async function initializeAndScheduleUpdates() {
    // 首次加载
    const newPhotoData = await fetchDailyPhoto();
    if (newPhotoData) {
        Object.assign(photoData, newPhotoData);
        updatePageContent();
    }

    // 设置定时更新
    setInterval(async () => {
        const newPhotoData = await fetchDailyPhoto();
        if (newPhotoData) {
            Object.assign(photoData, newPhotoData);
            updatePageContent();
        }
    }, 24 * 60 * 60 * 1000); // 24小时
}

// 更新页面内容
function updatePageContent() {
    // 更新日期
    const currentDate = new Date();
    document.getElementById('current-date').textContent = currentDate.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // 更新照片信息
    document.getElementById('daily-photo').src = photoData.imageUrl;
    document.getElementById('photo-title').textContent = photoData.title;
    document.getElementById('photographer-avatar').src = photoData.photographer.avatar;
    document.getElementById('photographer-name').textContent = photoData.photographer.name;
    document.getElementById('photographer-bio').textContent = photoData.photographer.bio;
    document.getElementById('photo-description').textContent = photoData.description;

    // 更新技术参数
    const technicalList = document.getElementById('technical-info');
    technicalList.innerHTML = photoData.technicalInfo
        .map(info => `<li>${info}</li>`)
        .join('');
}

// 页面加载完成后的处理
document.addEventListener('DOMContentLoaded', () => {
    updatePageContent();
    initializeAndScheduleUpdates();
});

// 添加图片加载错误处理
document.getElementById('daily-photo').addEventListener('error', function(e) {
    this.src = 'https://via.placeholder.com/800x600?text=图片加载失败';
});

document.getElementById('photographer-avatar').addEventListener('error', function(e) {
    this.src = 'https://via.placeholder.com/80x80?text=头像';
}); 
 
 
