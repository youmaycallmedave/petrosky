document.querySelectorAll('.features_list').forEach(featuresList => {
    const lists = featuresList.querySelectorAll('.fetures_item-line-list');
    const cardsCount = lists.length;
    if (cardsCount > 0) {
        const baseLines = Math.floor(TOTAL_LINES / cardsCount);
        const extra = TOTAL_LINES % cardsCount;
        lists.forEach((list, idx) => {
            list.innerHTML = '';
            const baseMin = 29;
            const baseMax = 81;
            const step = 50;
            let min = baseMin + idx * step;
            let max = baseMax + idx * step;
            const count = baseLines + (idx < extra ? 1 : 0);
            const scatter = 18;
            for (let i = 0; i < count; i++) {
                let baseHeight = Math.round(min + ((max - min) * i) / (count - 1));
                let randomShift = Math.round((Math.random() - 0.5) * 2 * scatter);
                let height = baseHeight + randomShift;
                height = Math.max(min, Math.min(max, height));
                if (i === 0) {
                    const wrap = document.createElement('div');
                    wrap.className = 'fetures_item-line-wrap';
                    const line = document.createElement('div');
                    line.className = 'fetures_item-line';
                    line.style.height = height + 'px';
                    const ic = document.createElement('div');
                    ic.className = 'fetures_item-line-ic';
                    wrap.appendChild(line);
                    wrap.appendChild(ic);
                    list.appendChild(wrap);
                } else {
                    const line = document.createElement('div');
                    line.className = 'fetures_item-line';
                    line.style.height = height + 'px';
                    list.appendChild(line);
                }
            }
        });
    }
});
