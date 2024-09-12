document.addEventListener('DOMContentLoaded', function() {
    const backgroundSlideshow = document.getElementById('background-slideshow');
    if (!backgroundSlideshow) {
        console.error('Element with id "background-slideshow" not found');
        return;
    }

    const images = [
        'airport-2373727_1280.jpg',
        'river-6519572_1280.jpg',
        'beach-6517214_1280.jpg',
    ];
    let currentImageIndex = 0;

    function createImageElement(src) {
        const div = document.createElement('div');
        div.className = 'background-image';
        div.style.backgroundImage = `url(/images/${src})`;
        return div;
    }

    function changeBackground() {
        const nextImageIndex = (currentImageIndex + 1) % images.length;
        const currentImage = backgroundSlideshow.querySelector('.background-image.active');
        const nextImage = createImageElement(images[nextImageIndex]);

        backgroundSlideshow.appendChild(nextImage);

        setTimeout(() => {
            nextImage.classList.add('active');
            if (currentImage) {
                currentImage.classList.remove('active');
                setTimeout(() => {
                    backgroundSlideshow.removeChild(currentImage);
                }, 1000);
            }
            currentImageIndex = nextImageIndex;
        }, 50);
    }

    // 最初の画像を設定
    changeBackground();

    // 3秒ごとに画像を切り替え
    setInterval(changeBackground, 5000);
});



function addScheduleItem() {
    const timeValue = document.getElementById('new-time-input').value;
    if (!timeValue) {
        alert('開始時間を入力してください。');
        return;
    }

    const endValue = document.getElementById('end-time-input').value;
    if (!endValue) {
        alert('終了時間を入力してください。');
        return;
    }

    const year = document.getElementById('dateInput').value;
    if (!year) {
        alert('日付を入力してください');
        return;
    }

    const timeSchedule = document.querySelector('.time-schedule');
    const newItem = document.createElement('li');

    newItem.innerHTML = `
        <span class="time" name="times">${timeValue}</span>
        ~
        <span class="endtime" name="times">${endValue}</span>
        <div class="sch_box">
            <input type="text" class="sch_tx" placeholder="内容テキスト" name="text">
        </div>
    `;

    timeSchedule.appendChild(newItem);

    // 時間でソートする
    sortScheduleByTime();
}

function sortScheduleByTime() {
    const timeSchedule = document.querySelector('.time-schedule');
    const items = Array.from(timeSchedule.querySelectorAll('li'));

    items.sort((a, b) => {
        const timeA = getTimeFromListItem(a);
        const timeB = getTimeFromListItem(b);

        if (timeA < timeB) return -1;
        if (timeA > timeB) return 1;
        return 0;
    });

    // リストをクリア
    timeSchedule.innerHTML = '';

    // ソート済みの項目を再度追加
    items.forEach(item => {
        timeSchedule.appendChild(item);
    });
}

function getTimeFromListItem(li) {
    const timeString = li.querySelector('.time').textContent.trim();
    const [hours, minutes] = timeString.split(':');
    return parseInt(hours) * 60 + parseInt(minutes);
}




