(function(root){
    var oCamera = document.getElementById('camera');
    var oPaint = document.getElementById('paint');
    var oTemp = document.getElementById('temp');

    var paintCtx = oPaint.getContext('2d');
    var tempCtx = oTemp.getContext('2d');
    var targetPos = {
        head: {
            left: 200,
            top: 45,
            radius: 25
        },
        body: {
            left: 200,
            top: 115,
            radius: 25
        },
        other: {
            left: 200,
            top: 185,
            radius: 25
        },
        STATUS: 'nodraw'
    };
    var pointerPositions = [
        0, 0,
        150, 150
    ];
    var circleState = [
        'green','white'
    ];
    var target = 490,
        cur = 0,
        stride = 0;

    var kernelX = [
            -1, 0, 1,
            -2, 0, 2,
            -1, 0, 1,
        ];
    var kernelY = [
        1, 2, 1,
        0, 0, 0,
        -1, -2, -1
    ];

    function renderer(image){
        /**pointer */
        pointerUniform = gl.getUniformLocation(program, "u_pointer[0]");
        circleStateUniform = gl.getUniformLocation(program, "u_circleState[0]");

        /**动画 */
        stride = (target - cur) / 10;
        cur += stride;
        pointerPositions = [
            cur, cur,
            cur+150, cur+150
        ];

        gl.uniform1fv(pointerUniform, pointerPositions);
        gl.uniform1fv(circleStateUniform, circleState);
        /**texture */
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    function render(image){
        /**cnavas 2d */

        createShader = WebGLUtils.createShader;
        createProgram = WebGLUtils.createProgram;

        canvas = document.getElementById('canvas'),
        gl = canvas.getContext('webgl');
        
        gl.viewport(0,0,canvas.width,canvas.height);

        /**init shaders and use program */
        var vertexSource = document.getElementById('shader-vs').text,
            vertexShader = createShader(gl, "VERTEX_SHADER",vertexSource);

        var fragSource = document.getElementById('shader-fs').text,
            fragShader = createShader(gl, "FRAGMENT_SHADER", fragSource);
        
        program = createProgram(gl, vertexShader, fragShader);

        gl.useProgram(program);

        
        /**set uniform */
        var resolveUniformLocation = gl.getUniformLocation(program, "u_resolution");
        gl.uniform2f(resolveUniformLocation, canvas.width, canvas.height);
        
        /**position  Buffer */
        var positonBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, positonBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(setRectangle(0, 0, canvas.width, canvas.height)), gl.STATIC_DRAW);

        /**texCoord Buffer */
        var texCoordBuffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            1.0, 1.0,
            0.0, 0.0,
            0.0, 1.0
        ]), gl.STATIC_DRAW);

        /**define position Arrib */
        var positionLocation = gl.getAttribLocation(program, "a_position");

        gl.bindBuffer(gl.ARRAY_BUFFER, positonBuffer);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        /**define tex Arrib */
        var texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
        
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.enableVertexAttribArray(texCoordLocation);
        gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

        /**set kernel */
        var kernelXLocation = gl.getUniformLocation(program, "u_kernelX[0]");
        var kernelYLocation = gl.getUniformLocation(program, "u_kernelY[0]");
        var textureSizeLocation = gl.getUniformLocation(program, "u_textureSize");

        texture = gl.createTexture()
        gl.uniform2f(textureSizeLocation, image.width, image.height);

        gl.uniform1fv(kernelXLocation, kernelX);
        gl.uniform1fv(kernelYLocation, kernelY);

        /**draw */
        //gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
    function setRectangle(x, y, width, height){
        return [
            x, y,
            x + width, y,
            x + width, y + height,
            x + width, y + height,
            x, y,
            x, y + height,
        ]
    }

    function drawFrame(){
        renderer(oCamera);
        if(targetPos.STATUS==='nodraw'){
            randomCircleCss();
        }
        detectFinger();
        requestAnimationFrame(drawFrame)
    }

    function randomCircle(){
        var left = 400,
            top = 200,
            radius = 5;
        paintCtx.beginPath();
        paintCtx.arc(left, top, radius, 0, Math.PI * 2);
        paintCtx.fillStyle = 'red';
        paintCtx.fill();

        targetPos.left = left;
        targetPos.top = top;
        targetPos.radius = radius;
        targetPos.STATUS = 'draw';
    }

    function randomCircleCss(clas){
        var left = 400,
            top = 200,
            radius = 5;
        
        var oCircle = document.createElement('div');
        var oTest = document.getElementById('test');

        oCircle.style.width = radius*2 +'px';
        oCircle.style.height = radius*2 +'px';
        oCircle.style.left = 400+'px';
        oCircle.style.top = 200+'px';
        oCircle.id = 'circle';
        oCircle.className = 'initial';

        targetPos.left = left;
        targetPos.top = top;
        targetPos.radius = radius;
        targetPos.STATUS = 'draw';

        targetPos.times = 0;
        oTest.appendChild(oCircle);
    }

    function detectFinger(){
        tempCtx.drawImage(oCamera, 0, 0);

        headLeft = targetPos.head.left;
        headTop = targetPos.head.top;
        headRadius = targetPos.head.radius;

        bodyLeft = targetPos.body.left;
        bodyTop = targetPos.body.top;
        bodyRadius = targetPos.body.radius;

        otherLeft = targetPos.other.left;
        otherTop = targetPos.other.top;
        otherRadius = targetPos.other.radius;

        var width = oTemp.width,
            height = oTemp.height,
            rangeL = width - (headLeft+headRadius),
            rangeT = headTop - headRadius;
        
        var rangeBL = width - (bodyLeft+bodyRadius),
            rangeBT = bodyTop - bodyRadius;

        var rangeOL = width - (otherLeft+otherRadius),
            rangeOT = otherTop - otherRadius;
        
        var headData = tempCtx.getImageData(rangeL, rangeT, headRadius*2, headRadius*2);
        headData = imageDataHRevert(panelCtx, headData);

        var bodyData = tempCtx.getImageData(rangeBL, rangeBT, bodyRadius*2, bodyRadius*2);
        bodyData = imageDataHRevert(panelCtx, bodyData);

        var otherData = tempCtx.getImageData(rangeOL, rangeOT, otherRadius*2, otherRadius*2);
        otherData = imageDataHRevert(panelCtx, otherData);

        if(magn(headRadius, headRadius, headData)===255){
            console.log('我摸到你了');
            paintHeadCss();
        }else if(magn(bodyRadius, bodyRadius, bodyData)===255){
            paintBodyCss();
        }else if(magn(otherRadius, otherRadius, otherData)===255){
            paintOtherCss();
        }
    }
    function magn(x, y, image){
        
        pixelAt = bindPixelAt(image);

        pixelX = (
            (kernelX[0] * calcAvg(x - 1, y - 1)) +
            (kernelX[1] * calcAvg(x, y - 1)) +
            (kernelX[2] * calcAvg(x + 1, y - 1)) +
            (kernelX[3] * calcAvg(x - 1, y)) +
            (kernelX[4] * calcAvg(x, y)) +
            (kernelX[5] * calcAvg(x + 1, y)) +
            (kernelX[6] * calcAvg(x - 1, y + 1)) +
            (kernelX[7] * calcAvg(x, y + 1)) +
            (kernelX[8] * calcAvg(x + 1, y + 1))
        );
        pixelY = (
          (kernelY[0] * calcAvg(x - 1, y - 1)) +
          (kernelY[1] * calcAvg(x, y - 1)) +
          (kernelY[2] * calcAvg(x + 1, y - 1)) +
          (kernelY[3] * calcAvg(x - 1, y)) +
          (kernelY[4] * calcAvg(x, y)) +
          (kernelY[5] * calcAvg(x + 1, y)) +
          (kernelY[6] * calcAvg(x - 1, y + 1)) +
          (kernelY[7] * calcAvg(x, y + 1)) +
          (kernelY[8] * calcAvg(x + 1, y + 1))
        );

        var magnitude = Math.sqrt((pixelX * pixelX) + (pixelY * pixelY));
        return magnitude > 60?  255 : 0;
    }

    function calcAvg(x, y){
        var red = pixelAt(x, y, 0);
        var green = pixelAt(x, y, 1);
        var blue = pixelAt(x, y, 2);
        return (red + green + blue) / 3; 
    }
    function bindPixelAt(image) {
        var data = image.data;
        //console.log(data.length);
        return function(x, y, i) {
            i = i || 0;
            //console.log(y, x, i);
            //  console.log(image);
            return data[((image.width * y) + x) * 4 + i];
        };
    }
    function imageDataHRevert(ctx,sourceData){
        var newData = ctx.createImageData(sourceData);

        newData.width = sourceData.width;
        for(var i=0,h=sourceData.height;i<h;i++){
            for(j=0,w=sourceData.width;j<w;j++){
                newData.data[i*w*4+j*4+0] = sourceData.data[i*w*4+(w-j)*4+0];
                newData.data[i*w*4+j*4+1] = sourceData.data[i*w*4+(w-j)*4+1];
                newData.data[i*w*4+j*4+2] = sourceData.data[i*w*4+(w-j)*4+2];
                newData.data[i*w*4+j*4+3] = sourceData.data[i*w*4+(w-j)*4+3];
            }
        }
        return newData;
    }
    /**动画1 */
    function paintFrame(){
        var centerLeft = targetPos.left,
            centerTop = targetPos.top,
            radius = target.radius;

        paintCtx.fillStyle = 'green';
        paintCtx.fillRect(centerLeft + radius, centerTop - radius, radius, radius);

        paintCtx.fillStyle = 'blue';
        paintCtx.fillRect(centerLeft - radius, centerTop + radius, radius, radius);

        paintCtx.fillStyle = 'orange';
        paintCtx.fillRect(centerLeft - 2*radius, centerTop - radius, radius, radius);

        paintCtx.fillStyle = 'white';
        paintCtx.fillRect(centerLeft - radius, centerTop - 2*radius, radius, radius);
    }
    function paintHeadCss(){
        var oC1 = document.getElementById('c1');
        var oHead = document.getElementById('Bhead');

        oHead.className += ' show';
        oC1.className += ' folder';
        
    }
    function paintBodyCss(){
        var oC2 = document.getElementById('c2');
        var oBody = document.getElementById('Bbody');

        oBody.className += ' show';
        oC2.className += ' folder';
        
    }

    function paintOtherCss(){
        var oC3 = document.getElementById('c3');
        var oHandl = document.getElementById('handl');
        var oHandr = document.getElementById('handr');
        var oLegl = document.getElementById('legl');
        var oLegr = document.getElementById('legr');

        oHandl.className += ' show';
        oHandr.className += ' show';
        oLegl.className += ' show';
        oLegr.className += ' show';
        oC3.className += ' folder';
        
    }

    oCamera.onloadedmetadata = function(){
        render(oCamera);
        panel = document.getElementById('panel');
        panelCtx = panel.getContext('2d');
        drawFrame();
    }
})(this);