//merges tree data into page template + inlines scripts
const fs = require('fs');


module.exports = function(treeData){
  const foamTreeScript = loadTextFile('./carrotsearch.foamtree.js');
  const treeDataString = JSON.stringify(treeData);

  //TODO: put the script here into a more sensible location
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <title>FoamTree Quick Start</title>
      <meta charset="utf-8" />
    </head>
  
    <body>

      <div class="container">
        <div id="visualization"></div>
      </div>
      <div class="tooltip">This is a test</div>

      <style>
        body{ 
          margin: 0; 
          overflow: hidden;
          font-family: sans-serif;
        }
        .container{ 
          display: flex; 
          height: 100vh; 
        }
        #visualization{ 
          width: 100%; 
        }
        .tooltip {
            position: absolute;
            z-index: 1000;
            max-width: 320px;
            word-break: break-all;
            display: none;
            background: #ddd;
            opacity: 0.85;
            padding: 10px;
        }
        .tooltip em{
          display: inline-block;
          font-style: normal;
          font-weight: bold;
          margin-bottom: 10px;
        }
      </style>

      <script>${foamTreeScript}</script>
      <script>
      (function(){

        var foamtree;

        window.addEventListener('load', function() {
          foamtree = new CarrotSearchFoamTree({
            id: 'visualization',
            dataObject: ${treeDataString},
            layoutByWeightOrder:true,
            layout: 'squarified',
            stacking: 'flattened',
            pixelRatio: window.devicePixelRatio || 1,
            maxGroupLevelsDrawn: Number.MAX_VALUE,
            maxGroupLevelsAttached:Number.MAX_VALUE,
            maxGroupLabelLevelsDrawn: Number.MAX_VALUE,
            rolloutDuration: 0,
            pullbackDuration: 0,
            fadeDuration: 0,
            zoomMouseWheelDuration: 300,
            openCloseDuration: 200,
            groupLabelVerticalPadding: 0.2,
            groupBorderRadius: 0,
            
            //TODO: follow up later
            onGroupHover:function(e){
              if (e.group && e.group.label) {
                console.log(e.group);
                tooltip.style.display = "block";
                tooltip.innerHTML = formatTooltip(e.group);
              } else {
                tooltip.style.display = "none";
              }
            },

            //zoom to group rather than that weird pop out thing
            onGroupDoubleClick: function(e) {
              e.preventDefault();
              var group = e.group;
              var toZoom;
              if (group) {
                toZoom = e.secondary ? group.parent : group;
              } else {
                toZoom = this.get("dataObject");
              }
              this.zoom(toZoom);
            }

          });
        });
  
        window.addEventListener("resize", (function() {
          var timeout;
          return function() {
            window.clearTimeout(timeout);
            timeout = window.setTimeout(foamtree.resize, 300);
          };
        })());

        function formatTooltip(group){
          var gzipSize = group.formattedGzipSize ? (' (gzipped: ' + group.formattedGzipSize +  ')') : '';
          var t = '<em>' + group.label + '</em>';
          t += '<div>' + group.path + '</div>';
          t += '<div>Size:' + group.formattedSize + gzipSize + '</div>';
          t += '<div>Time: ' + group.formattedTime + '</div>';
          return t;
        }

        var tooltip = document.querySelector('.tooltip');
        document.addEventListener('mousemove', function(e){
          tooltip.style.left =
              e.pageX + tooltip.clientWidth + 20 < document.body.clientWidth ?
              e.pageX + 10 + 'px' :
              document.body.clientWidth - 10 - tooltip.clientWidth + 'px';
          tooltip.style.top =
              e.pageY + tooltip.clientHeight + 20 <
              document.body.clientHeight ?
              e.pageY + 10 + 'px' : 
              document.body.clientHeight - 10 - tooltip.clientHeight + 'px';
        });

      })();
      </script>
    </body>
  </html>
  `;
};

function loadTextFile(filePath){
  const filename = require.resolve(filePath);
  return fs.readFileSync(filename, 'utf8');
}