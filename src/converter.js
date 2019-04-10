import ol from 'openlayers'
import {Script} from 'vm';

class Converter {

    convert(dataset) {
        let heatmapVectorSource = new ol.source.Vector({
            format: ol.format.GeoJSON(),
        });
        let circleVectorSource = new ol.source.Vector({
            format: new ol.format.GeoJSON(),
        })
        for (let i in dataset) {
            let coordinates = dataset[i].loc

            /**
             * 生成两种格式的Feature
             */

            let circleFeature = new ol.Feature(new ol.geom.Circle(ol.proj.transform(coordinates, 'EPSG:4326', 'EPSG:3857'), dataset[i].value * 2000));
            let heatmapfeature = new ol.Feature({
                id: dataset[i].key,
                geometry: new ol.geom.Point(ol.proj.transform(coordinates, 'EPSG:4326', 'EPSG:3857'), 0),
                count: dataset[i].value,
            });

            /**
             * 为热力图设置权重
             */
            heatmapfeature.set('weight', dataset[i].value / 30);


            circleVectorSource.addFeature(circleFeature);
            heatmapVectorSource.addFeature(heatmapfeature)
        }
        return [heatmapVectorSource, circleVectorSource]
    }
}

export default Converter;
