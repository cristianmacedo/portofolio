imgs = window.document.querySelectorAll('img')
dk = '/img/darknight.jpg'

setInterval(async () => {
    for (const img of imgs){
        old = img.src
        img.src = dk
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                img.src = old
                resolve()
            }, Math.random()*3000);
        })
    };
}, Math.random()*2000);