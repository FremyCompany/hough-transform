window.onload = function() {

  var $img = document.getElementById('source');

  var $source = document.createElement('canvas');
  $source.setAttribute('style', $img.getAttribute('style'));
  $source.width = 400;
  $source.height = 300;
  var source = $source.getContext('2d');
  source.drawImage($img, 0, 0);
  $source.id = 'source';

  var $destin = document.getElementById('destin');
  var destin = $destin.getContext('2d');
  destin.drawImage($img, 0, 0);

  $img.parentNode.replaceChild($source, $img);

  //window['runNextStep'] = runFinalStep;

}













var cx = 0;
var cy = 0;
var X_MAX = 400;
var Y_MAX = 300;
function runNextStep() {

  var sss = document.getElementById('source-section').style;
  sss.display = 'block';
  sss.top = `${cy}px`;
  sss.left = `${cx}px`;

  var $xctx = document.getElementById('input-original')// as HTMLCanvasElement;
  var $ictx = document.getElementById('input')// as HTMLCanvasElement;
  //var $octx = document.getElementById('output')// as HTMLCanvasElement;
  var $l1ctx = document.getElementById('line1')// as HTMLCanvasElement;
  var $l2ctx = document.getElementById('line2')// as HTMLCanvasElement;
  var $source = document.getElementById('source');
  var $destin = document.getElementById('destin');


  var ANGLE_AMOUNT = 90;
  var INPUT_WIDTH = $ictx.width;
  var INPUT_HEIGHT = $ictx.height;
  var X_STEP = INPUT_WIDTH;
  var Y_STEP = INPUT_HEIGHT;
  var RHO_MAX = Math.sqrt(INPUT_WIDTH * INPUT_WIDTH + INPUT_HEIGHT * INPUT_HEIGHT);


  // Set the size of the Hough space.
  //$octx.width = ANGLE_AMOUNT;
  //$octx.height = RHO_MAX;

  var xctx = $xctx.getContext('2d');
  var ictx = $ictx.getContext('2d');
  //var octx = $octx.getContext('2d');
  var l1ctx = $l1ctx.getContext('2d');
  var l2ctx = $l2ctx.getContext('2d');
  var destin = $destin.getContext('2d');
  var source = $source.getContext('2d');
  //octx.fillStyle = 'rgba(0,0,0,.1)';
  l1ctx.clearRect(0,0,X_STEP,Y_STEP);
  l2ctx.clearRect(0,0,X_STEP,Y_STEP);


  // Precalculate tables.
  var cosTable = new Array(ANGLE_AMOUNT);
  var sinTable = new Array(ANGLE_AMOUNT);
  for (var theta = 0, thetaIndex = 0; thetaIndex < ANGLE_AMOUNT; theta += Math.PI / ANGLE_AMOUNT, thetaIndex++) {
    cosTable[thetaIndex] = Math.cos(theta);
    sinTable[thetaIndex] = Math.sin(theta);
  }


  // Implementation with lookup tables.
  function houghAcc(x, y, v) {
    var rho;
    var thetaIndex = 0;
    x -= INPUT_WIDTH / 2;
    y -= INPUT_HEIGHT / 2;
    for (; thetaIndex < ANGLE_AMOUNT; thetaIndex++) {
      rho = RHO_MAX + x * cosTable[thetaIndex] + y * sinTable[thetaIndex];
      rho = (2*rho)|0;
      if (accum[thetaIndex] == undefined) accum[thetaIndex] = [];
      if (accum[thetaIndex][rho] == undefined) {
        accum[thetaIndex][rho] = 1*v;
      } else {
        accum[thetaIndex][rho] += 1*v;
      }

      //if(v>=0) {
      //  octx.beginPath();
      //  octx.fillRect(thetaIndex, Math.floor(rho/4), 1, 1);
      //  octx.closePath();
      //}
    }

  }

  xctx.drawImage($source, -cx, -cy);
  ictx.drawImage($source, -cx, -cy);
  ictx.lineWidth = 5;

  var ictx_imageData = ictx.getImageData(0, 0, INPUT_WIDTH, INPUT_HEIGHT).data;
  var ictx_getImageData = function ictx_getImageData(x, y) {
    if(x < 0) return 0;
    if(y < 0) return 0;
    if(x >= INPUT_WIDTH) return 0;
    if(y >= INPUT_HEIGHT) return 0;
    return ictx_imageData[4*(x+INPUT_WIDTH*y)];
  };

  var iter = 15;
  do {
    var foundSomeLine = false;
    var accum = new Array(ANGLE_AMOUNT);

    for(var ix = INPUT_WIDTH; ix--;) {
      for(var iy = INPUT_HEIGHT; iy--;) {
        if(ictx_getImageData(ix, iy) > 10) {
          houghAcc(ix, iy, +1);
        } else {
          var sum = 0; var n_s = 1;
          for(var jx = ix-n_s; jx<=ix+n_s; jx++) { 
            for(var jy = iy-n_s; jy<=iy+n_s; jy++) { 
              sum += ictx_getImageData(jx,jy);
            }
          }
          if(sum == 0) {
            houghAcc(ix, iy, -(50*50)/(INPUT_WIDTH*INPUT_HEIGHT));
          }
        }
      }
    }

    var max_a_1 = 0, max_a_2 = 0;
    var max_r_1 = 0, max_r_2 = 0;
    var max_v_1 = 0, max_v_2 = 0;
    for(var ia = ANGLE_AMOUNT; ia--;) {
      var angle = ia/ANGLE_AMOUNT*180;
      if(angle >= 60 && angle <= 120) {
        for(var ir in accum[ia]) {
          if(accum[ia][ir] > max_v_1) {
            max_a_1 = ia;
            max_r_1 = ir|0;
            max_v_1 = accum[ia][ir]
          }
        }
      } else if(angle <= 30 || angle >= 160) {
        for(var ir in accum[ia]) {
          if(accum[ia][ir] > max_v_2) {
            max_a_2 = ia;
            max_r_2 = ir|0;
            max_v_2 = accum[ia][ir]
          }
        }
      }
    }
    
    if(/*max_v_1 >= max_v_2 && */max_v_1 > 10) {
      foundSomeLine = true;
      var r = max_r_1/2 - RHO_MAX;
      var angle = max_a_1/ANGLE_AMOUNT*Math.PI;
      if(max_a_1 == 0) {
        l1ctx.beginPath();
        l1ctx.moveTo(INPUT_WIDTH/2 + r, 0);
        l1ctx.lineTo(INPUT_WIDTH/2 + r, INPUT_HEIGHT);
        l1ctx.stroke();

        ictx.beginPath();
        ictx.moveTo(RHO_MAX/2 + r, 0);
        ictx.lineTo(RHO_MAX/2 + r, Y_STEP);
        ictx.stroke();

      } else {
        l1ctx.beginPath();
        l1ctx.moveTo(0, INPUT_HEIGHT/2 + (r/Math.sin(angle) + INPUT_WIDTH/2/Math.tan(angle)));
        l1ctx.lineTo(INPUT_WIDTH, INPUT_HEIGHT/2 + (r/Math.sin(angle) - INPUT_WIDTH/2/Math.tan(angle)));
        l1ctx.stroke();

        ictx.beginPath();
        ictx.moveTo(0, INPUT_HEIGHT/2 + (r/Math.sin(angle) + INPUT_WIDTH/2/Math.tan(angle)));
        ictx.lineTo(INPUT_WIDTH, INPUT_HEIGHT/2 + (r/Math.sin(angle) - INPUT_WIDTH/2/Math.tan(angle)));
        ictx.stroke();

      }
    }

    if(/*max_v_2 >= max_v_1 && */max_v_2 > 10) {
      foundSomeLine = true;
      var r = max_r_2/2 - RHO_MAX;
      var angle = max_a_2/ANGLE_AMOUNT*Math.PI;

      if(max_a_2 == 0) {
        l2ctx.beginPath();
        l2ctx.moveTo(INPUT_WIDTH/2 + r, 0);
        l2ctx.lineTo(INPUT_WIDTH/2 + r, INPUT_HEIGHT);
        l2ctx.stroke();

        ictx.beginPath();
        ictx.moveTo(INPUT_WIDTH/2 + r, 0);
        ictx.lineTo(INPUT_WIDTH/2 + r, INPUT_HEIGHT);
        ictx.stroke();

      } else {
        l2ctx.beginPath();
        l2ctx.moveTo(0, INPUT_HEIGHT/2 + (r/Math.sin(angle) + INPUT_WIDTH/2/Math.tan(angle)));
        l2ctx.lineTo(INPUT_WIDTH, INPUT_HEIGHT/2 + (r/Math.sin(angle) - INPUT_WIDTH/2/Math.tan(angle)));
        l2ctx.stroke();

        ictx.beginPath();
        ictx.moveTo(0, INPUT_HEIGHT/2 + (r/Math.sin(angle) + INPUT_WIDTH/2/Math.tan(angle)));
        ictx.lineTo(INPUT_WIDTH, INPUT_HEIGHT/2 + (r/Math.sin(angle) - INPUT_WIDTH/2/Math.tan(angle)));
        ictx.stroke();
      }
    }

    ictx_imageData = ictx.getImageData(0, 0, INPUT_WIDTH, INPUT_HEIGHT).data

  } while(foundSomeLine && (iter-- > 0));

  //alert(`${max_a_1} + ${max_r_1-RHO_MAX/2} --> ${max_v_1}`);
  //alert(`${max_a_2} + ${max_r_2-RHO_MAX/2} --> ${max_v_2}`);

  /*var accum = new Array(ANGLE_AMOUNT);

  for(var ix = INPUT_WIDTH; ix--;) {
    for(var iy = INPUT_HEIGHT; iy--;) {
      if(ictx.getImageData(ix, iy, 1, 1).data[0] > 10) {
        houghAcc(ix, iy, +1);
      } else {
        houghAcc(ix, iy, -1);
      }
    }
  }

  for(var a1 in accum) {
    for(var a2 in accum[a1]) {
      if(accum[a1][a2] > 20) {

        var r = 2*(a2|0) - RHO_MAX;
        var angle = (a1|0)/ANGLE_AMOUNT*Math.PI;

        if(angle == 0) {
          l1ctx.beginPath();
          l1ctx.moveTo(RHO_MAX/2 + r, 0);
          l1ctx.lineTo(RHO_MAX/2 + r, Y_STEP);
          l1ctx.stroke();

          ictx.beginPath();
          ictx.moveTo(RHO_MAX/2 + r, 0);
          ictx.lineTo(RHO_MAX/2 + r, Y_STEP);
          ictx.stroke();

        } else {
          l1ctx.beginPath();
          l1ctx.moveTo(0, INPUT_HEIGHT/2 + (r/Math.sin(angle) + INPUT_WIDTH/2/Math.tan(angle)));
          l1ctx.lineTo(INPUT_WIDTH, INPUT_HEIGHT/2 + (r/Math.sin(angle) - INPUT_WIDTH/2/Math.tan(angle)));
          l1ctx.stroke();

          ictx.beginPath();
          ictx.moveTo(0, INPUT_HEIGHT/2 + (r/Math.sin(angle) + INPUT_WIDTH/2/Math.tan(angle)));
          ictx.lineTo(INPUT_WIDTH, INPUT_HEIGHT/2 + (r/Math.sin(angle) - INPUT_WIDTH/2/Math.tan(angle)));
          ictx.stroke();

        }
      }

    }
  }*/

  destin.globalCompositeOperation = 'difference';
  destin.drawImage($ictx, cx, cy);

  sss.width = `${$ictx.width}px`;
  sss.height = `${$ictx.height}px`;

  cx += X_STEP;
  if(cx >= X_MAX) {
    cx = 0;
    cy += Y_STEP;
    if(cy >= Y_MAX) {
      cx = 0;
      cy = 0;
      //alert('Done!');
      $l1ctx.width = $l2ctx.width = $xctx.width = $ictx.width = $ictx.width * 2;
      $l1ctx.height = $l2ctx.height = $xctx.height = $ictx.height = $ictx.height * 2;
      source.drawImage($destin, 0, 0);

      window['runNextStep'] = runFinalStep;
      
    }
  }

}





















function runFinalStep() {

  var cx = 0, cy = 0;
  var sss = document.getElementById('source-section').style;
  sss.display = 'block';
  sss.top = `${cy}px`;
  sss.left = `${cx}px`;

  var $ictx = document.getElementById('source')// as HTMLCanvasElement;
  var $l1ctx = document.getElementById('destin')// as HTMLCanvasElement;
  var $destin = $l1ctx;
  sss.width = `${$ictx.width}px`;
  sss.height = `${$ictx.height}px`;

  var ANGLE_AMOUNT = 360;
  var INPUT_WIDTH = $ictx.width;
  var INPUT_HEIGHT = $ictx.height;
  var X_STEP = INPUT_WIDTH;
  var Y_STEP = INPUT_HEIGHT;
  var RHO_MAX = Math.sqrt(INPUT_WIDTH * INPUT_WIDTH + INPUT_HEIGHT * INPUT_HEIGHT);

  var ictx = $ictx.getContext('2d');
  var l1ctx = $l1ctx.getContext('2d');
  l1ctx.globalCompositeOperation = 'source-over';
  l1ctx.fillStyle = 'white';
  l1ctx.fillRect(0,0,INPUT_WIDTH,INPUT_HEIGHT);

  // Precalculate tables.
  var cosTable = new Array(ANGLE_AMOUNT);
  var sinTable = new Array(ANGLE_AMOUNT);
  for (var theta = 0, thetaIndex = 0; thetaIndex < ANGLE_AMOUNT; theta += Math.PI / ANGLE_AMOUNT, thetaIndex++) {
    cosTable[thetaIndex] = Math.cos(theta);
    sinTable[thetaIndex] = Math.sin(theta);
  }

  // Implementation with lookup tables.
  function houghAcc(x, y, v) {
    var rho;
    var thetaIndex = 0;
    x -= INPUT_WIDTH / 2;
    y -= INPUT_HEIGHT / 2;
    for (; thetaIndex < ANGLE_AMOUNT; thetaIndex++) {
      rho = RHO_MAX + x * cosTable[thetaIndex] + y * sinTable[thetaIndex];
      rho = (rho*2)|0;
      if (accum[thetaIndex] == undefined) accum[thetaIndex] = [];
      if (accum[thetaIndex][rho] == undefined) {
        accum[thetaIndex][rho] = 1*v;
      } else {
        accum[thetaIndex][rho] += 1*v;
      }
    }

  }

  var ictx_imageData = ictx.getImageData(0, 0, INPUT_WIDTH, INPUT_HEIGHT).data;
  var ictx_getImageData = function ictx_getImageData(x, y) {
    if(x < 0) return 0;
    if(y < 0) return 0;
    if(x >= INPUT_WIDTH) return 0;
    if(y >= INPUT_HEIGHT) return 0;
    return ictx_imageData[4*(x+INPUT_WIDTH*y)];
  };
  /*var accum = new Array(ANGLE_AMOUNT);

  for(var ix = INPUT_WIDTH; ix--;) {
    for(var iy = INPUT_HEIGHT; iy--;) {
      if(ictx_getImageData(ix, iy) > 10) {
        houghAcc(ix, iy, +1);
      }/* else {
        houghAcc(ix, iy, -1);
      }* /
    }
  }

  for(var a1 in accum) {
    for(var a2 in accum[a1]) {
      if(accum[a1][a2] > 100) {

        var r = 2*(a2|0) - RHO_MAX;
        var angle = (a1|0)/ANGLE_AMOUNT*Math.PI;

        if(angle == 0) {
          l1ctx.beginPath();
          l1ctx.moveTo(INPUT_WIDTH/2 + r, 0);
          l1ctx.lineTo(INPUT_WIDTH/2 + r, INPUT_HEIGHT);
          l1ctx.stroke();

        } else {
          l1ctx.beginPath();
          l1ctx.moveTo(0, INPUT_HEIGHT/2 + (r/Math.sin(angle) + INPUT_WIDTH/2/Math.tan(angle)));
          l1ctx.lineTo(INPUT_WIDTH, INPUT_HEIGHT/2 + (r/Math.sin(angle) - INPUT_WIDTH/2/Math.tan(angle)));
          l1ctx.stroke();

        }

      }

    }
  }*/

  ictx.lineWidth = 10;
  l1ctx.lineWidth = 3;

  var iter = 2;
  do {
    var foundSomeLine = false;
    var accum = new Array(ANGLE_AMOUNT);

    for(var ix = INPUT_WIDTH; ix--;) {
      for(var iy = INPUT_HEIGHT; iy--;) {
        if(ictx_getImageData(ix, iy) > 10) {
          houghAcc(ix, iy, +1);
        }/* else {
          houghAcc(ix, iy, -1);
        }*/
      }
    }

    var max_a_1 = 0, max_a_2 = 0, max_a_3 = 0, max_a_4 = 0;
    var max_r_1 = 0, max_r_2 = 0, max_r_3 = 0, max_r_4 = 0;
    var max_v_1 = 0, max_v_2 = 0, max_v_3 = 0, max_v_4 = 0;
    for(var ia = ANGLE_AMOUNT; ia--;) {
      var angle = ia/ANGLE_AMOUNT*180;
      if(angle >= 60 && angle <= 120) {
        for(var ir in accum[ia]) {
          ir = ir|0;
          if(ir > RHO_MAX*2) {
            if(accum[ia][ir] > max_v_1) {
              max_a_1 = ia;
              max_r_1 = ir;
              max_v_1 = accum[ia][ir]
            }
          } else {
            if(accum[ia][ir] > max_v_3) {
              max_a_3 = ia;
              max_r_3 = ir;
              max_v_3 = accum[ia][ir]
            }
          }
        }
      } else if(angle <= 30) {
        for(var ir in accum[ia]) {
          ir = ir|0;
          if(ir > RHO_MAX*2) {
            if(accum[ia][ir] > max_v_2) {
              max_a_2 = ia;
              max_r_2 = ir;
              max_v_2 = accum[ia][ir]
            }
          } else {
            if(accum[ia][ir] > max_v_4) {
              max_a_4 = ia;
              max_r_4 = ir;
              max_v_4 = accum[ia][ir]
            }
          }
        }
      } else if(angle >= 160) {
        for(var ir in accum[ia]) {
          ir = ir|0;
          if(ir > RHO_MAX*2) {
            if(accum[ia][ir] > max_v_4) {
              max_a_4 = ia;
              max_r_4 = ir;
              max_v_4 = accum[ia][ir]
            }
          } else {
            if(accum[ia][ir] > max_v_2) {
              max_a_2 = ia;
              max_r_2 = ir;
              max_v_2 = accum[ia][ir]
            }
          }
        }
      }
    }
    
    if(max_v_1 > 0) { // horizontal bottom
      foundSomeLine = true;
      var r = max_r_1/2 - RHO_MAX;
      var angle = max_a_1/ANGLE_AMOUNT*Math.PI;
      if(max_a_1 == 0) {
        l1ctx.beginPath();
        l1ctx.moveTo(INPUT_WIDTH/2 + r, 0);
        l1ctx.lineTo(INPUT_WIDTH/2 + r, INPUT_HEIGHT);
        l1ctx.stroke();

        ictx.beginPath();
        ictx.moveTo(INPUT_WIDTH/2 + r, 0);
        ictx.lineTo(INPUT_WIDTH/2 + r, INPUT_HEIGHT);
        ictx.stroke();

      } else {
        l1ctx.beginPath();
        l1ctx.moveTo(0, INPUT_HEIGHT/2 + (r/Math.sin(angle) + INPUT_WIDTH/2/Math.tan(angle)));
        l1ctx.lineTo(INPUT_WIDTH, INPUT_HEIGHT/2 + (r/Math.sin(angle) - INPUT_WIDTH/2/Math.tan(angle)));
        l1ctx.stroke();

        ictx.beginPath();
        ictx.moveTo(0, INPUT_HEIGHT/2 + (r/Math.sin(angle) + INPUT_WIDTH/2/Math.tan(angle)));
        ictx.lineTo(INPUT_WIDTH, INPUT_HEIGHT/2 + (r/Math.sin(angle) - INPUT_WIDTH/2/Math.tan(angle)));
        ictx.stroke();

      }
    }/**/

    if(max_v_2 > 0) {//vertical right
      foundSomeLine = true;
      var r = max_r_2/2 - RHO_MAX;
      var angle = max_a_2/ANGLE_AMOUNT*Math.PI;

      if(max_a_2 == 0) {
        l1ctx.beginPath();
        l1ctx.moveTo(INPUT_WIDTH/2 + r, 0);
        l1ctx.lineTo(INPUT_WIDTH/2 + r, INPUT_HEIGHT);
        l1ctx.stroke();

        ictx.beginPath();
        ictx.moveTo(INPUT_WIDTH/2 + r, 0);
        ictx.lineTo(INPUT_WIDTH/2 + r, INPUT_HEIGHT);
        ictx.stroke();

      } else {
        l1ctx.beginPath();
        l1ctx.moveTo(0, INPUT_HEIGHT/2 + (r/Math.sin(angle) + INPUT_WIDTH/2/Math.tan(angle)));
        l1ctx.lineTo(INPUT_WIDTH, INPUT_HEIGHT/2 + (r/Math.sin(angle) - INPUT_WIDTH/2/Math.tan(angle)));
        l1ctx.stroke();

        ictx.beginPath();
        ictx.moveTo(0, INPUT_HEIGHT/2 + (r/Math.sin(angle) + INPUT_WIDTH/2/Math.tan(angle)));
        ictx.lineTo(INPUT_WIDTH, INPUT_HEIGHT/2 + (r/Math.sin(angle) - INPUT_WIDTH/2/Math.tan(angle)));
        ictx.stroke();
      }
    }/**/

    if(max_v_3 > 0) { // horizontal top
      foundSomeLine = true;
      var r = max_r_3/2 - RHO_MAX;
      var angle = max_a_3/ANGLE_AMOUNT*Math.PI;

      if(max_a_3 == 0) {
        l1ctx.beginPath();
        l1ctx.moveTo(INPUT_WIDTH/2 + r, 0);
        l1ctx.lineTo(INPUT_WIDTH/2 + r, INPUT_HEIGHT);
        l1ctx.stroke();

        ictx.beginPath();
        ictx.moveTo(INPUT_WIDTH/2 + r, 0);
        ictx.lineTo(INPUT_WIDTH/2 + r, INPUT_HEIGHT);
        ictx.stroke();

      } else {
        l1ctx.beginPath();
        l1ctx.moveTo(0, INPUT_HEIGHT/2 + (r/Math.sin(angle) + INPUT_WIDTH/2/Math.tan(angle)));
        l1ctx.lineTo(INPUT_WIDTH, INPUT_HEIGHT/2 + (r/Math.sin(angle) - INPUT_WIDTH/2/Math.tan(angle)));
        l1ctx.stroke();

        ictx.beginPath();
        ictx.moveTo(0, INPUT_HEIGHT/2 + (r/Math.sin(angle) + INPUT_WIDTH/2/Math.tan(angle)));
        ictx.lineTo(INPUT_WIDTH, INPUT_HEIGHT/2 + (r/Math.sin(angle) - INPUT_WIDTH/2/Math.tan(angle)));
        ictx.stroke();
      }
    }/**/

    if(max_v_4 > 0) { // vertical left
      foundSomeLine = true;
      var r = max_r_4/2 - RHO_MAX;
      var angle = max_a_4/ANGLE_AMOUNT*Math.PI;

      if(max_a_4 == 0) {
        l1ctx.beginPath();
        l1ctx.moveTo(INPUT_WIDTH/2 + r, 0);
        l1ctx.lineTo(INPUT_WIDTH/2 + r, INPUT_HEIGHT);
        l1ctx.stroke();

        ictx.beginPath();
        ictx.moveTo(INPUT_WIDTH/2 + r, 0);
        ictx.lineTo(INPUT_WIDTH/2 + r, INPUT_HEIGHT);
        ictx.stroke();

      } else {
        l1ctx.beginPath();
        l1ctx.moveTo(0, INPUT_HEIGHT/2 + (r/Math.sin(angle) + INPUT_WIDTH/2/Math.tan(angle)));
        l1ctx.lineTo(INPUT_WIDTH, INPUT_HEIGHT/2 + (r/Math.sin(angle) - INPUT_WIDTH/2/Math.tan(angle)));
        l1ctx.stroke();

        ictx.beginPath();
        ictx.moveTo(0, INPUT_HEIGHT/2 + (r/Math.sin(angle) + INPUT_WIDTH/2/Math.tan(angle)));
        ictx.lineTo(INPUT_WIDTH, INPUT_HEIGHT/2 + (r/Math.sin(angle) - INPUT_WIDTH/2/Math.tan(angle)));
        ictx.stroke();
      }
    }/**/

    l1ctx.globalAlpha *= 0.4;
    ictx_imageData = ictx.getImageData(0, 0, INPUT_WIDTH, INPUT_HEIGHT).data

  } while(foundSomeLine && (iter-- > 0));

  window['runNextStep'] = function() {};
}