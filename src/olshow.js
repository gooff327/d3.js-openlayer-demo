import * as d3 from 'd3'
import ol from 'openlayers'
class Ol {

    render(heatMapVectorSource,circleVectorSource) {
        // 热力图
        console.log(circleVectorSource.getFeatures())
        let mapStatus = true;
        let tipWrapper = document.getElementById('tipWrapper');
        let tipContent = document.getElementById('tipContent');

        var heatMapLayer = new ol.layer.Heatmap({
            source:heatMapVectorSource,
            blur: 15,
            radius: 13
        });
        const raster = new ol.layer.Tile({
            source: new ol.source.Stamen({
                layer: 'toner'
            })
        });


        var heatMap = new ol.Map({
            layers: [raster, heatMapLayer],
            target: 'map',
            view: new ol.View({
                center: ol.proj.fromLonLat([106.530635, 29.544606]),
                zoom: 4
            })
        });

        /**
         * feature相差很大
         *
         * 分开渲染
         */

        const circleStyle = new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(20, 100, 240, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                width: 2,
                color: 'rgba(0, 200, 200, 0.8)'
            })
        });

        const circleLayer = new ol.layer.Vector({
            source: circleVectorSource,
            style: circleStyle
        });

        var circleMap =new ol.Map({
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                }),
                circleLayer
            ],
            target: '',
            controls: ol.control.defaults({
                attributionOptions: ({
                    collapsible: false
                })
            }),
            view: new ol.View({
                center: ol.proj.fromLonLat([106.530635, 29.544606]),
                zoom: 4
            })
        });
        /**
         *
         * 挂载叠加层
         * 挂载事件监听
         *
         *
         */
        var overlay = new ol.Overlay({
            element: tipWrapper,
            autoPan: true
        });

        makeResponse(heatMap,overlay);
        makeResponse(circleMap,overlay);

        function makeResponse(target,overlay) {
            target.on('click', function (e) {
                var pixel = target.getEventPixel(e.originalEvent);
                target.forEachFeatureAtPixel(pixel, function (feature) {
                    let income = 0
                    if (!mapStatus) {
                        income = (feature.getGeometry().B[2] - feature.getGeometry().B[0]) * 5;
                    }else {
                        income = feature.get('count')*10000
                    }

                    var coodinate = e.coordinate;
                    tipContent.innerHTML = '平均收入' + income + '元';
                    overlay.setPosition(coodinate);
                    target.addOverlay(overlay);
                });
            });

        }

        function switchMap(bool) {
            console.log(bool)
            if (bool) {
                heatMap.setTarget('');
                circleMap.setTarget('map');
                mapStatus = !mapStatus;
            } else {
                circleMap.setTarget('');
                heatMap.setTarget('map');
                mapStatus = !mapStatus;
            }
        }
        d3.select('.switchButton').on('click',()=>{switchMap(mapStatus)})
    }






}

export default Ol;
