import * as d3 from 'd3'
import {scaleLinear} from "d3";
import {scaleOrdinal, schemeSet3} from "d3";
import {max} from "d3";
import originData from './data';

class D3 {

    render(argData) {
        let chart = d3.select('.reverseChart');
        let front = chart.selectAll('.front');
        let width = front._groups[0][0].clientWidth;
        let height =front._groups[0][0].clientHeight;
        let datasets = argData.slice(0) //深拷贝传入数据
        let rankSignal = true; //排序信号
        const padding = {top: 20, left: 20, right: 20, bottom: 20};
        let color = scaleOrdinal(d3.schemeCategory10); //颜色集
        function createFrontSvg(chart, width, height) {
            const frontSvg = chart.select('.front').append('svg').attr('width', width).attr('height', height);
            return frontSvg
        }

        const frontSvg = createFrontSvg(chart, width, height);

        /**
         * 计算当前宽度最多容纳元素
         * */


        let computeWidth = 0
        const maxSize = (dataset, width, padding) => {
            console.log(dataset)
            if ((width - 2 * padding.left) / dataset.length < 30) {
                computeWidth = 30
                return dataset.slice(0, parseInt((width - 2 * padding.left) / 30) - 1)
            }
            computeWidth = 30
            return dataset
        }
        datasets = maxSize(datasets, width, padding);

        /**
         * 比例尺设定
         * */

        let yAxisLength = height - padding.top - padding.bottom;
        let yScale = scaleLinear().domain([0, max(datasets, d => d.value)]).rangeRound([yAxisLength, 0]);
        let yAxis = d3.axisLeft(yScale);
        let rectWidth = computeWidth;

        /**
         * 初始化Tip
         * */

        const tips = d3.select('.front').append('div')
            .attr('class', 'tips')
            .style('opacity', 0)
            .style('z-index', 2);

        /**
         * 初始化矩形
         * */

        const initRect = obj => {
            obj.attr('width', rectWidth - 4)
                .style('opacity', 0.7)
                .on('mouseenter', function (d, i) {            //添加鼠标监听事件
                    obj._groups[0][i].style.cssText = 'opacity:1;stroke:#CC0033;'
                    tips.transition()
                        .duration(200)
                        .style('opacity', 0.8);
                    tips.html(`<span id='tip' style='color: darkslategrey'>${d.key}:${d.value}</span>`) 				        //提示框的内容
                        .style('left', padding.left + i * rectWidth + 'px')          //提示框的位置
                        .style('top', height - padding.bottom - (yScale(0) - yScale(d.value)) + 30 + 'px')
                })
                .on('mouseleave', function (d, i) {
                    obj._groups[0][i].style.cssText = 'opacity:0.7';
                    tips.style('opacity', 0)
                })
                .on('mouseout', function (d, i) {
                    obj._groups[0][i].style.cssText = 'opacity:0.7';
                    tips.style('opacity', 0)
                })
                .attr('rx', 4)
                .attr('ry', 4)
                .attr('height', 0)
                .attr('x', (d, i) => 2 * padding.left + i * rectWidth)
                .attr('y', 0)
                .transition()
                .delay((d, i) => i * 100)
                .duration(400)
                .attr('y', (d, i) => height - padding.bottom - (yScale(0) - yScale(d.value)))
                .attr('height', d => yScale(0) - yScale(d.value))
                .attr('stroke', '#BEBEBE')
                .attr('fill', (d, i) => color(i))
                .style('z-index', 1)
        };

        /**
         * 初始化下方标签
         * */

        const initLabel = obj => {
            obj.attr('fill', '#5e5d5c')
                .attr('class', 'labelText')
                .attr('font-size', '12px')
                .attr('text-anchor', 'middle')
                .attr('x', (d, i) => i * rectWidth)
                .attr('y', height + 100)
                .text(d => '')
                .transition()
                .delay((d, i) => i * 100)
                .duration(400)
                .attr('x', (d, i) => i * rectWidth)
                .attr('y', height)
                .text(d => d.key)
                .attr('transform', `translate(0,-${padding.bottom / 3})`)
                .attr('dx', padding.left + rectWidth)
        };

        /**
         * 初始化折线
         * */

        let line = d3.line()
            .x((d, i) => 2 * padding.left + rectWidth / 2 + i * rectWidth)
            .y((d, i) => height - padding.bottom - (yScale(0) - yScale(d.value)));


        let initPath = obj => {
            obj.attr('d', line(datasets))
                .transition()
                .delay((d, i) => i * 100)
                .duration(400)
                .attr('stroke', 'rgb(0,201,200)')
                .attr('stroke-width', 3)
                .attr('fill', 'none')
                .attr('class', 'line');
            console.log('originData', originData[0], datasets[0])
        };

        /**
         * 初始化圆心
         * */

        const initPoint = obj => {
            obj.attr('cx', line.x())
                .attr('cy', 0)
                .attr('r', 0)
                .transition()
                .delay((d, i) => i * 100)
                .duration(400)
                .attr('cx', line.x())
                .attr('cy', line.y())
                .attr('r', 4)
                .attr('stroke', 'rgb(0,201,200)')
                .attr('stroke-width', 3)
                .attr('fill', '#fff');
        }

        /**
         * 画布细节设定
         * */
        frontSvg.attr('class', 'frontSvg').append('g').attr('class', 'axis').attr('storke', 'rgb(0,141,200)')
            .attr('transform', `translate(${1.5 * padding.left},${height - yAxisLength - padding.bottom})`)
            .call(yAxis)
            .append('text')
            .text('平均收入(万元)')
            .attr('transform', 'rotate(-90)')        //text旋转-90°
            .attr('text-anchor', 'end')        //字体尾部对齐
            .attr('dy', '1em')
            .attr('fill', '#696969');

        const renderSvg = (dataset, frontSvg) => {
            initRect(frontSvg.selectAll('rect').data(dataset).enter().append('rect'));
            initLabel(frontSvg.selectAll('.labelText').data(dataset).enter().append('text'));
            initPath(frontSvg.append('path'));
            initPoint(frontSvg.selectAll('circle').data(dataset).enter().append('circle'));
        };

        /**
         * 开始渲染画布
         * */

        renderSvg(datasets, frontSvg);

        /**
         * 画布刷新方法
         * */

        const updateSvg = dataset => {
            initRect(frontSvg.selectAll('rect').data(dataset));
            initLabel(frontSvg.selectAll('.labelText').data(dataset));
            frontSvg.selectAll('path').remove();
            frontSvg.selectAll('circle').remove();
            initPoint(frontSvg.selectAll('circle').data(dataset).enter().append('circle'))
            initPath(frontSvg.append('path'));

        };


        /**
         * 排序方法
         * */
        function rank() {
            if (rankSignal === true) {
                datasets.sort(function (a, b) {
                    d3.select('.rankButton').text('还 原')
                    return d3.ascending(a.value, b.value);
                });
                rankSignal = !rankSignal;
                updateSvg(datasets)

            } else {
                d3.select('.rankButton').text('排 序')
                rankSignal = !rankSignal;
                datasets = argData.slice(0)
                updateSvg(datasets)
            }
        }

        d3.select('.rankButton').on('click', () => rank(datasets))

        /**
         * 添加tip 文本
         * */

        d3.select('axis').append('text')
            .text('价格（元）')
            .attr('dy', '1em');

    }

}

export default D3;
