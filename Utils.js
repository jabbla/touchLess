(function(root){
    var createShader = function(ctx, type, source){
        var shader = ctx.createShader(ctx[type]);
        
        ctx.shaderSource(shader,source);
        ctx.compileShader(shader);

        var success = ctx.getShaderParameter(shader, ctx.COMPILE_STATUS);

        if(success){
            return shader;
        }

        throw new Error('shader compile failed');
    }

    var createProgram = function(ctx, vertexShader, fragShader){
        var program = ctx.createProgram();

        ctx.attachShader(program, vertexShader);
        ctx.attachShader(program, fragShader);
        ctx.linkProgram(program);

        var success = ctx.getProgramParameter(program, ctx.LINK_STATUS);
        
        if(success){
            return program;
        }

        throw new Error('program link failed');
    }

    root.WebGLUtils = {
        createShader: createShader,
        createProgram: createProgram
    };
})(this)