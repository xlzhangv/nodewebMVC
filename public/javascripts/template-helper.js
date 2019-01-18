(function (t) {
    /**
     * <script type="text/html" id="alarm-tbody-template">
         <tr  id="{{id}}" class="{{switchWarnLevelClass level}}">
         <td>{{time}}</td>
         </tr>
     </script>
     * @param v
     * @returns {*}
     */
    window['switchWarnLevelClass'] = function (v) {
        v = parseInt(v);
        switch (v) {
            case 1 :
                return 'red-font'
                break;
            case 2 :
                return 'orange-font'
                break;
            case 3 :
                return 'green-font'
                break;
        }
    }
    template.helper("switchWarnLevelClass", switchWarnLevelClass);

})(template);