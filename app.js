// 示例数据 - 在实际应用中，这些数据应该从后端 API 获取
const photoData = {
    title: "晨雾中的山峦",
    imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    photographer: {
        name: "张明",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
        bio: "自然风光摄影师，专注于捕捉大自然的瞬间之美。获得多个国际摄影奖项，作品被多家知名杂志收录。"
    },
    description: "这张照片拍摄于黄山的一个清晨，薄雾笼罩着连绵的山峦，形成层次分明的视觉效果。摄影师选择在日出时分拍摄，利用晨光穿透雾气的瞬间，展现出空灵而富有诗意的画面。照片中的色调以蓝色和金色为主，营造出宁静而温暖的氛围。",
    technicalInfo: [
        "相机: Sony A7R IV",
        "镜头: 24-70mm f/2.8 GM",
        "光圈: f/8",
        "快门速度: 1/125s",
        "ISO: 100",
        "焦距: 35mm"
    ]
};

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

// 页面加载完成后更新内容
document.addEventListener('DOMContentLoaded', updatePageContent);

// 添加图片加载错误处理
document.getElementById('daily-photo').addEventListener('error', function(e) {
    this.src = 'https://via.placeholder.com/800x600?text=图片加载失败';
});

document.getElementById('photographer-avatar').addEventListener('error', function(e) {
    this.src = 'https://via.placeholder.com/80x80?text=头像';
}); 