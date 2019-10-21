
import dragarea from './drag_area.js';
import graphsettings from './graph_settings.js';


const app = new Vue({

    el: '#app',

    data: {
        json : null
    },

    components : { dragarea, graphsettings },

    methods : {
        jsonCharged : function(json) { this.json = JSON.parse(JSON.stringify(json)); }
    }
});



window.addEventListener('DOMContentLoaded', () => {

});

