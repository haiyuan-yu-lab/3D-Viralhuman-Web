// Set smaller font size if viewport is small (e.g. iPhone 5)
if (window.innerWidth < 375) {
    $(".footer-text").css("font-size", "8pt")
}

// Arc data
for (let i = 0; i < data_hprot.length; i++) {
    if (data_hprot[i].name !== "") {
        let o = new Option(data_hprot[i].name.toUpperCase(), data_hprot[i].name);
        $(o).html(data_hprot[i].name + ": " + viralUniprotToGene[data_hprot[i].name] + ": " + viralUniprotToProteinTrue[data_hprot[i].name]);
        $("#prot1").append(o);
    }
}

// Global variable
let currChosen = undefined;


function drawShapes(id) {
    let color = d3.scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(d3.quantize(t => d3.interpolateGnBu(t * 0.6 + 0.2), data.length - 1));

    let svgWidth = $("#" + id).width();
    let svgHeight = Math.min($("#" + id).width(), $("main").innerHeight());
    let svgContainer = d3.select("#" + id).append("svg").attr('width', svgWidth).attr('height', svgHeight);
    let pie = d3.pie().padAngle(0.005).sort(null).value(d => d.value);
    let arcs = pie(data);
    let arc = d3.arc()
        .innerRadius(svgHeight / 2 * 0.7)
        .outerRadius(svgHeight / 2 * 0.9)
        .startAngle(function(d) { return d.startAngle + 6 * Math.PI / 180; })
        .endAngle(function(d) { return d.endAngle + 6 * Math.PI / 180; });

    // Adding arcs
    let arcPaths = svgContainer.selectAll("path")
        .data(arcs.filter(function (d) {
            if (d.data.name === "") return false;
            return true;
        }))
        .join("path")
        .attr("fill", function(d) { return color(d.data.name); })
        .attr("id", d => `${d.data.name}-arc`)
        .attr("class", function(d) { if (d.data.name === "") return ""; else return "prot-arc"; })
        .attr("d", arc)
        .attr("transform", "translate(" + (svgWidth / 2).toString() + "," + (svgHeight / 2).toString() + ")")
        .style("opacity", 1)
        .append("title")
        .text(d => `${d.data.name}`);

    let circle = svgContainer.append("circle")
        .attr("cx", svgWidth / 2)
        .attr("cy", svgHeight / 2)
        .attr("r", svgHeight / 2 * 0.65)
        .attr("class", "svg-circle")
        .style("fill", "#eaf5f5");

    function computeTextRotation(d) {
        var a = (d.endAngle) * 180 / Math.PI - 90;
        return a > 90 ? a - 180 : a;
    }

    function getFontSize(d) {
        const textLength = d.data.name.length;
        const arcLength = (d.endAngle - d.startAngle) * (svgHeight * 0.9);
        return Math.min((arcLength / textLength), 26); // 16 is the max font size
    }

    // Adding text
    let textElements = svgContainer.append("g")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (svgWidth / 2).toString() + "," + (svgHeight / 2).toString() + ")")
        .selectAll("text")
        .data(arcs)
        .join("text")
        .attr("transform", function(d){
            return "translate(" + arc.centroid(d) + ")rotate(" + computeTextRotation(d) + ")";
        })
        .attr("pointer-events", "none")
        .each(function(d) {
            const text = d.data.name.toUpperCase();
            const firstLine = text.slice(0, -7);
            const secondLine = text.slice(-7);

            d3.select(this)
                .append("tspan")
                .attr("x", 0)
                .attr("y", "-0.6em")
                .attr("font-size", d => `${getFontSize(d)}px`)
                .text(firstLine);

            d3.select(this)
                .append("tspan")
                .attr("x", 0)
                .attr("y", "0.6em")
                .attr("font-size", d => `${getFontSize(d)}px`)
                .text(secondLine);
        });

    // Handling mouse events on arcs
    svgContainer.selectAll("path")
        .on("mouseover", function(d) {
            d3.select(this)
                .transition()
                .attr('d', d3.arc()
                    .innerRadius(svgHeight / 2 * 0.7)
                    .outerRadius(svgHeight / 2 * 0.95)
                    .startAngle(function(d) { return d.startAngle + 6 * Math.PI / 180; })
                    .endAngle(function(d) { return d.endAngle + 6 * Math.PI / 180; })
                )
                .style("fill", function(d) {
                    if (d.data.name === "") return "#f5f5f5";
                    else return d3.color(d3.select(this).attr("fill")).darker(1);
                });
        })
        .on("mouseout", function(d) {
            if (! $(`#${this.id.split('-')[0]}-arc`).hasClass("arc-clicked")) {
                d3.select(this)
                    .transition()
                    .attr('d', d3.arc()
                        .innerRadius(svgHeight / 2 * 0.7)
                        .outerRadius(svgHeight / 2 * 0.9)
                        .startAngle(function(d) { return d.startAngle + 6 * Math.PI / 180; })
                        .endAngle(function(d) { return d.endAngle + 6 * Math.PI / 180; })
                    )
                    .style("fill", function (d) {
                        if (d.data.name === "") return "#f5f5f5";
                        else return color(d.data.name);
                    });
            }
        })
        .on("click", function(d) {
            // Click event logic
            if (d.data.name === currChosen) return;
            if (currChosen !== undefined) {
                let oldArcDiv = $(`#${currChosen}-arc`);
                d3.select(oldArcDiv[0])
                    .transition()
                    .attr('d', d3.arc()
                        .innerRadius(svgHeight / 2 * 0.7)
                        .outerRadius(svgHeight / 2 * 0.9)
                        .startAngle(function(d) { return d.startAngle + 6 * Math.PI / 180; })
                        .endAngle(function(d) { return d.endAngle + 6 * Math.PI / 180; })
                    )
                    .style("fill", function (d) {
                        if (d.data.name === "") return "#f5f5f5";
                        else return color(d.data.name);
                    });
                oldArcDiv.removeClass("arc-clicked");
            }
            let arcDiv = $(`#${d.data.name}-arc`);
            if (arcDiv.hasClass("arc-clicked")) {
                arcDiv.removeClass("arc-clicked");
                currChosen = undefined;
                selectByViralFamily(currChosen);
            } else {
                arcDiv.addClass("arc-clicked");
                currChosen = d.data.name;
                selectByViralFamily(currChosen);
            }
        });

}
/*function drawShapes(id) {
    let color = d3.scaleOrdinal()
        .domain(data.map(d => d.name))
        .range(d3.quantize(t => d3.interpolateGnBu(t * 0.6 + 0.2), data.length - 1));

    let svgWidth = $("#" + id).width();
    let svgHeight = Math.min($("#" + id).width(), $("main").innerHeight());
    let svgContainer = d3.select("#" + id).append("svg").attr('width', svgWidth).attr('height', svgHeight);
    let pie = d3.pie().padAngle(0.005).sort(null).value(d => d.value);
    let arcs = pie(data);
    let arc = d3.arc()
        .innerRadius(svgHeight / 2 * 0.7)
        .outerRadius(svgHeight / 2 * 0.9)
        .startAngle(function(d) { return d.startAngle + 6 * Math.PI / 180; })
        .endAngle(function(d) { return d.endAngle + 6 * Math.PI / 180; });

    // Adding arcs
    svgContainer.selectAll("path")
        .data(arcs.filter(function (d) {
            if (d.data.name === "") return false;
            return true;
        }))
        .join("path")
        .attr("fill", function(d) { return color(d.data.name); })
        .attr("id", d => `${d.data.name}-arc`)
        .attr("class", function(d) { if (d.data.name === "") return ""; else return "prot-arc"; })
        .attr("d", arc)
        .attr("transform", "translate(" + (svgWidth / 2).toString() + "," + (svgHeight / 2).toString() + ")")
        .style("opacity", 1)
        .append("title")
        .text(d => `${d.data.name}`);

    let circle = svgContainer.append("circle")
        .attr("cx", svgWidth / 2)
        .attr("cy", svgHeight / 2)
        .attr("r", svgHeight / 2 * 0.65)
        .attr("class", "svg-circle")
        .style("fill", "#eaf5f5");

    function computeTextRotation(d) {
        var a = (d.endAngle) * 180 / Math.PI - 90;
        return a > 90 ? a - 180 : a;
    }

    function getFontSize(d) {
        const textLength = d.data.name.length;
        const arcLength = (d.endAngle - d.startAngle) * (svgHeight * 0.9);
        return Math.min((arcLength / textLength), 26); // 16 is the max font size
    }

    // Adding text
    let textElements = svgContainer.append("g")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (svgWidth / 2).toString() + "," + (svgHeight / 2).toString() + ")")
        .selectAll("text")
        .data(arcs)
        .join("text")
        .attr("transform", function(d){
            return "translate(" + arc.centroid(d) + ")rotate(" + computeTextRotation(d) + ")";
        })
        .attr("pointer-events", "none")
        .each(function(d) {
            const text = d.data.name.toUpperCase();
            const firstLine = text.slice(0, -7);
            const secondLine = text.slice(-7);

            d3.select(this)
                .append("tspan")
                .attr("x", 0)
                .attr("y", "-0.6em")
                .attr("font-size", d => `${getFontSize(d)}px`)
                .text(firstLine);

            d3.select(this)
                .append("tspan")
                .attr("x", 0)
                .attr("y", "0.6em")
                .attr("font-size", d => `${getFontSize(d)}px`)
                .text(secondLine);
        });

    // Handling mouse events on arcs
    svgContainer.selectAll("path")
        .on("mouseover", function(d) {
            d3.select(this)
                .transition()
                .attr('d', d3.arc()
                    .innerRadius(svgHeight / 2 * 0.7)
                    .outerRadius(svgHeight / 2 * 0.95)
                    .startAngle(function(d) { return d.startAngle + 6 * Math.PI / 180; })
                    .endAngle(function(d) { return d.endAngle + 6 * Math.PI / 180; })
                )
                .style("fill", function(d) {
                    if (d.data.name === "") return "#f5f5f5";
                    else return d3.color(d3.select(this).attr("fill")).darker(1);
                });
        })
        .on("mouseout", function(d) {
            if (! $(`#${this.id.split('-')[0]}-arc`).hasClass("arc-clicked")) {
                d3.select(this)
                    .transition()
                    .attr('d', d3.arc()
                        .innerRadius(svgHeight / 2 * 0.7)
                        .outerRadius(svgHeight / 2 * 0.9)
                        .startAngle(function(d) { return d.startAngle + 6 * Math.PI / 180; })
                        .endAngle(function(d) { return d.endAngle + 6 * Math.PI / 180; })
                    )
                    .style("fill", function (d) {
                        if (d.data.name === "") return "#f5f5f5";
                        else return color(d.data.name);
                    });
            }
        })
        .on("click", function(event, d) {
            handleArcClick(d);
        });

    // Handling mouse events on text
    svgContainer.selectAll("text")
        .on("click", function(event, d) {
            handleArcClick(d);
        });

    function handleArcClick(d) {
        if (d.data.name === currChosen) return;
        if (currChosen !== undefined) {
            let oldArcDiv = $(`#${currChosen}-arc`);
            d3.select(oldArcDiv[0])
                .transition()
                .attr('d', d3.arc()
                    .innerRadius(svgHeight / 2 * 0.7)
                    .outerRadius(svgHeight / 2 * 0.9)
                    .startAngle(function(d) { return d.startAngle + 6 * Math.PI / 180; })
                    .endAngle(function(d) { return d.endAngle + 6 * Math.PI / 180; })
                )
                .style("fill", function (d) {
                    if (d.data.name === "") return "#f5f5f5";
                    else return color(d.data.name);
                });
            oldArcDiv.removeClass("arc-clicked");
        }
        let arcDiv = $(`#${d.data.name}-arc`);
        if (arcDiv.hasClass("arc-clicked")) {
            arcDiv.removeClass("arc-clicked");
            currChosen = undefined;
            selectByViralFamily(currChosen);
        } else {
            arcDiv.addClass("arc-clicked");
            currChosen = d.data.name;
            selectByViralFamily(currChosen);
        }
    }
}
*/
function selectByViralFamily(vfam) {
    if (vfam != "ALL") {
        $("#prot1").empty();
        let setI = 0;
        for (let i = 0; i < data_hprot.length; i++) {
            if (data_hprot[i].family == vfam) {
                if (setI == 0){
                    setI = 1;
                    $("#prot1").val(data_hprot[i].name + ": " + viralUniprotToGene[data_hprot[i].name] + ": " + viralUniprotToProteinTrue[data_hprot[i].name]);
                }
                let o = new Option(data_hprot[i].name, data_hprot[i].name);
                $(o).html(data_hprot[i].name + ": " + viralUniprotToGene[data_hprot[i].name] + ": " + viralUniprotToProteinTrue[data_hprot[i].name]);
                $("#prot1").append(o);
            }
        }
    } else {
        $("#prot1").empty();
        $("#prot1").val(data_hprot[0].name);
        for (let i = 0; i < data_hprot.length; i++) {
            let o = new Option(data_hprot[i].name, data_hprot[i].name);
            $(o).html(data_hprot[i].name + ": " + viralUniprotToGene[data_hprot[i].name] + ": " + viralUniprotToProteinTrue[data_hprot[i].name]);
            $("#prot1").append(o);
        }
    }
    populateInteractor();
}

function populateInteractor() {
    $("#prot2").empty();
    let selectedViral = $("#prot1").val();
    let disabledAttr = $("#prot2").attr("disabled");
    if (selectedViral === "--" || interactionByViralProt[selectedViral] === undefined) {
        if (typeof disabledAttr === typeof undefined || disabledAttr === false) $("#prot2").attr("disabled", true);
        return;
    }
    for (let i = 0; i < interactionByViralProt[selectedViral].length; i++) {
        if (interactionByViralProt[selectedViral][i] !== "") {
            let o = new Option(interactionByViralProt[selectedViral][i], interactionByViralProt[selectedViral][i]);
            $(o).html(interactionByViralProt[selectedViral][i] + ": " + humanUniprotToGene[interactionByViralProt[selectedViral][i]] + ": " + humanUniprotToProteinTrue[interactionByViralProt[selectedViral][i]]);
            $("#prot2").append(o);
        }
    }
    if (typeof disabledAttr !== typeof undefined && disabledAttr !== false) $("#prot2").removeAttr("disabled");
}

drawShapes("arc-svg");

$(window).on('resize', function() {
    d3.select("#arc-svg > svg").remove();
    drawShapes("arc-svg");
});

particlesJS("particles-js", {
    "particles": {
        "number": {
            "value": 80,
            "density": { "enable": true, "value_area": 800 },
        },
        "color": { "value": "#ff3b00" },
        "shape": {
            "type": "circle",
            "stroke": { "width": 0, "color": "#000000" },
            "polygon": { "nb_sides": 5 },
            "image": { "src": "img/github.svg", "width": 100, "height": 100 },
        },
        "opacity": {
            "value": 0.5,
            "random": false,
            "anim": {
                "enable": false,
                "speed": 1,
                "opacity_min": 0.1,
                "sync": false
            },
        },
        "size": {
            "value": 3,
            "random": true,
            "anim": {
                "enable": false,
                "speed": 40,
                "size_min": 0.1,
                "sync": false
            },
        },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#e32828",
            "opacity": 0.4,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 2,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false,
            "attract": { "enable": false, "rotateX": 600, "rotateY": 1200 },
        },
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": { "enable": false, "mode": "repulse" },
            "onclick": { "enable": true, "mode": "push" },
            "resize": true
        },
        "modes": {
            "grab": { "distance": 400, "line_linked": { "opacity": 1 } },
            "bubble": { "distance": 400, "size": 40, "duration": 2, "opacity": 8, "speed": 3 },
            "repulse": { "distance": 200, "duration": 0.4 }, "push": { "particles_nb": 4 },
            "remove": { "particles_nb": 2 },
        },
    },
    "retina_detect": true
});

update = function() {
    requestAnimationFrame(update);
};
requestAnimationFrame(update);
