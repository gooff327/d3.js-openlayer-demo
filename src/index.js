import * as d3 from 'd3'
import Entrance from './entrance'
var enter = new Entrance();

/**
 * 翻转按钮方法
 * */

let reverseStatus = false;
d3.select('.reverseButton').on('click', () => {
    var chart = d3.select('.reverseChart');
    reverseStatus = !reverseStatus;
    reverseStatus ? chart.style('transform', 'rotateY(180deg)') : chart.style('transform', 'rotateY(360deg)');
})

/**
 * 渲染入口
 * */
enter.render();
