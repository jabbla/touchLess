(function(root){
    var convert = function(x, y){
        return [
            x, y,
            x + 1, y,
            x + 1, y + 1,
            x + 1, y + 1,
            x, y,
            x, y + 1,
        ];
    }

    root.WebGLUtils.convert = convert;
})(this)