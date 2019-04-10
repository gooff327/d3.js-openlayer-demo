import d3 from './d3show';
import ol from './olshow';
import Converter from './converter';
import originData from "./data";


class Entrance {
    constructor() {
        this.d3 = new d3();
        this.ol = new ol();
        this.converter = new Converter()
    }

    /**
     * 组件的渲染
     */
    render() {
        var d3Dataset = originData;
        this.d3.render(d3Dataset);
        let vectorData = this.converter.convert(originData);
        this.ol.render(vectorData[0],vectorData[1]);
    }
}

export default Entrance;
