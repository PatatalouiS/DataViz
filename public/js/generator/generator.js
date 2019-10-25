
import dragarea from './drag_area.js';
import graphsettings from './graph_settings.js';
import graph from './graph.js'


const app = new Vue({

    el: '#app',

    data: {
        json : null,
        showGraph : true
    },

    components : { dragarea, graphsettings, graph },

    methods : {
        jsonCharged : function(json) { this.json = JSON.parse(JSON.stringify(json)); }
    }
});








window.addEventListener('DOMContentLoaded', () => {});



