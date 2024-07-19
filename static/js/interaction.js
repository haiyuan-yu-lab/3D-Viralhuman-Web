let showingDocked = false;

// Custom load functions.
function loadProteinWithDockingInterface(protein) {
    let colorList = [];
    // Color interface residues with interface predicted from docking.
    for (let i = 0; i < filteredViralIndices.length; i++) colorList.push(["#08519c", filteredViralIndices[i] + ":B"]);
    for (let i = 0; i < filteredHumanIndices.length; i++) colorList.push(["#006d2c", filteredHumanIndices[i] + ":C"]);
    colorList = colorList.concat([["#c6dbef", ":B"], ["#c7e9c0", ":C"]]);
    let colorScheme = NGL.ColormakerRegistry.addSelectionScheme(colorList);
    window["colorScheme-viewport"] = colorScheme;
    protein.addRepresentation("cartoon", {color: colorScheme, smoothSheet: true});
    protein.autoView("*", 500);
}

function loadDockedLigand(protein) {
    let colorList = [["#c7e9c0", ":B"], ["#ff4c4c", ":C and .C"], ["#3333ff", ":C and .O"], ["#e5e5e5", ":C and .H"],
        ["#e5c53f", ":C and .S"], ["#ff7f00", ":C and .P"], ["#8aff00", ":C"]];
    let colorScheme = NGL.ColormakerRegistry.addSelectionScheme(colorList);
    window["colorScheme-viewport"] = colorScheme;
    protein.addRepresentation("cartoon", {color: colorScheme, smoothSheet: true});
    protein.addRepresentation("hyperball", {color: colorScheme, sele: ":C"});
    protein.autoView("*", 500);
}

function loadViralProteinWithECLAIRInterface(protein) {
    let colorList = [];
    // Color interface residues with interface predicted from ECLAIR.
    for (let i = 0; i < filteredViralIndices.length; i++)
        colorList.push(["#08519c", filteredViralIndices[i] + ":B"]);
    colorList = colorList.concat([["#c6dbef", ":B"]]);
    let colorScheme = NGL.ColormakerRegistry.addSelectionScheme(colorList);
    window["colorScheme-viral-viewport"] = colorScheme;
    protein.addRepresentation("cartoon", {color: colorScheme, smoothSheet: true});
    protein.autoView("*", 500);
}

function loadHumanProteinWithECLAIRInterface(protein) {
    let colorList = [];
    // Color interface residues with interface predicted from ECLAIR.
    for (let i = 0; i < filteredHumanIndices.length; i++)
        colorList.push(["#006d2c", filteredHumanIndices[i] + ":C"]);
    colorList = colorList.concat([["#c7e9c0", ":C"]]);
    let colorScheme = NGL.ColormakerRegistry.addSelectionScheme(colorList);
    window["colorScheme-human-viewport"] = colorScheme;
    protein.addRepresentation("cartoon", {color: colorScheme, smoothSheet: true});
    protein.autoView("*", 500);
}

// Display docked structures.
function showDocked() {
    // A list of dictionaries to pass to MultiLoader.
    let modelDataList = [];
    for (let i = 0; i < docked.length; i++) {
        let tmpDataDict = {
            "name": i.toString(),
            "type": "url",
            "value": staticPrefix + "docked_models/" + docked[i]["file"],
            "loadFx": window["loadProteinWithDockingInterface"],
        };
        modelDataList.push(tmpDataDict);
    }
    NGL.specialOps.multiLoader("viewport", modelDataList, "#ffffff", 0);
    $("[data-toggle='protein']:not([role='NGL'])").protein();
    $("#viewport").viewport();

    // Adjust height of model-info to be the same as the viewport.
    if (window.innerWidth > 1024){
        $("#model-info").css("min-height", $("#viewport1-outer-div").innerHeight());
    }
}

function decrementDocked() {
    // Update `currentIndex`.
    if (currentIndex === 0) currentIndex = docked.length - 1;
    else currentIndex -= 1;
    // Update model index shown in the viewport.
    $("#docked-model-tagline-text").text((currentIndex + 1).toString() + " / " + docked.length.toString());
    $("#docked-model-name").text(`Score: ${docked[currentIndex]["score"].toFixed(2)}, Attempt: ${docked[currentIndex]["attempt"]}`);
}

function incrementDocked() {
    // Update `currentIndex`.
    if (currentIndex === docked.length - 1) currentIndex = 0;
    else currentIndex += 1;
    // Update model index shown in the viewport.
    $("#docked-model-tagline-text").text((currentIndex + 1).toString() + " / " + docked.length.toString());
    $("#docked-model-name").text(`Score: ${docked[currentIndex]["score"].toFixed(2)}, Attempt: ${docked[currentIndex]["attempt"]}`);
}

// Display single structures.
function showSingle() {
    if (viral_single.hasOwnProperty("file") && human_single.hasOwnProperty("file")) {
        let viralDataList = [{
            "name": "viral",
            "type": "url",
            "value": staticPrefix + "single_models/" + viral_single["file"],
            "loadFx": window["loadViralProteinWithECLAIRInterface"]
        }];
        NGL.specialOps.multiLoader("viral-viewport", viralDataList, "#ffffff", 0);
        let humanDataList = [{
            "name": "human",
            "type": "url",
            "value": staticPrefix + "single_models/" + human_single["file"],
            "loadFx": window["loadHumanProteinWithECLAIRInterface"]
        }];
        NGL.specialOps.multiLoader("human-viewport", humanDataList, "#ffffff", 0);
        $(".viral-single").removeAttr("hidden");
        $(".human-single").removeAttr("hidden");
        $("[data-toggle='protein']:not([role='NGL'])").protein();
        $("#human-viewport").viewport();
    } else if (viral_single.hasOwnProperty("file")) {
        let viralDataList = [{
            "name": "viral",
            "type": "url",
            "value": staticPrefix + "single_models/" + viral_single["file"],
            "loadFx": window["loadViralProteinWithECLAIRInterface"]
        }];
        NGL.specialOps.multiLoader("viral-viewport", viralDataList, "#ffffff", 0);
        $("[data-toggle='protein']:not([role='NGL'])").protein();
        $(".viral-single").removeAttr("hidden");
        $("#viral-viewport").viewport();
        $("#human-viewport").text("No structural model available for " + interactionString.split("_")[1] + ".");
    } else if (human_single.hasOwnProperty("file")) {
        let humanDataList = [{
            "name": "human",
            "type": "url",
            "value": staticPrefix + "single_models/" + human_single["file"],
            "loadFx": window["loadHumanProteinWithECLAIRInterface"]
        }];
        NGL.specialOps.multiLoader("human-viewport", humanDataList, "#ffffff", 0);
        $(".human-single").removeAttr("hidden");
        $("[data-toggle='protein']:not([role='NGL'])").protein();
        $("#human-viewport").viewport();
        $("#viral-viewport").text("No structural model available for " + interactionString.split("_")[0] + ".");
    } else {
        $("#viral-viewport").text("No structural model available for " + interactionString.split("_")[0] + ".");
        $("#human-viewport").text("No structural model available for " + interactionString.split("_")[1] + ".");
    }
}

// Switch between docked and single structures.
function switchDockedSingle() {
    if (showingDocked) {
        $("#viewport-outer-div").attr("hidden", true);
        if (window.innerWidth > 1024) {
            $("#viral-viewport-outer-div").removeAttr("hidden");
            $("#human-viewport-outer-div").removeAttr("hidden");
            $("#viral-viewport").css("min-height", window.innerHeight * 0.25);
            $("#human-viewport").css("min-height", window.innerHeight * 0.25);
            $("#infobox").css("height", window.innerHeight * 0.25);
        } else {
            $("#viral-viewport-outer-div").removeAttr("hidden");
            $("#human-viewport-outer-div").removeAttr("hidden");
            $("#viral-viewport").css("min-height", window.innerHeight * 0.2);
            $("#human-viewport").css("min-height", window.innerHeight * 0.2);
            $("#infobox").css("height", window.innerHeight * 0.2);
        }
        delete myData;
        showSingle();
        showingDocked = false;
    } else {
        $("#viral-viewport-outer-div").attr("hidden", true);
        $("#human-viewport-outer-div").attr("hidden", true);
        if (window.innerWidth > 1024) {
            $("#viewport-outer-div").removeAttr("hidden");
            $("#viewport").css("min-height", window.innerHeight * 0.38);
            $("#infobox").css("height", window.innerHeight * 0.38);
        } else {
            $("#viewport-outer-div").removeAttr("hidden");
            $("#viewport").css("min-height", window.innerHeight * 0.28);
            $("#infobox").css("height", window.innerHeight * 0.28);
        }
        delete myData;
        showDocked();
        showingDocked = true;
    }
    $("#viral-res-table").css("max-height", $("#infobox").innerHeight() - $("#residue-nav").innerHeight() - $("#toggle-row").innerHeight() - 45);
    $("#human-res-table").css("max-height", $("#infobox").innerHeight() - $("#residue-nav").innerHeight() - $("#toggle-row").innerHeight() - 45);
}

// Draw colorbars for interface enrichment
function drawColorBar(id, schemeName, n, val, start, end, type) {
    let colors;
    if (d3[`scheme${schemeName}`] && d3[`scheme${schemeName}`][n]) {
        colors = d3[`scheme${schemeName}`][n];
    } else {
        const interpolate = d3[`interpolate${schemeName}`];
        colors = [];
        for (let i = 0; i < n; ++i) {
            colors.push(d3.rgb(interpolate(i / (n - 1))).hex());
        }
    }
    // Create colobar data
    colors = colors.reverse();
    let svgWidth = $("#"+id).width();
    let svgContainer = d3.select("#" + id).append("svg").attr('width', svgWidth).attr('height', 45);
    let legend = svgContainer.append("defs")
        .append("svg:linearGradient")
        .attr("id", "gradient-" + schemeName + "-" + id)
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "100%")
        .attr("y2", "100%")
        .attr("spreadMethod", "pad");
    for (let i = 0; i < n; i++) {
        legend.append("stop")
        .attr("offset", (i * 100/ n).toFixed(2) + "%")
        .attr("stop-color", colors[i])
        .attr("stop-opacity", 1);
    }
    // Draw colorbar.
    svgContainer.append("rect")
        .attr("width", svgWidth * 0.9)
        .attr("height", 20)
        .attr("x", svgWidth * 0.05)
        .attr("y", 10)
        .style("fill", `url(#gradient-${schemeName}-${id})`);
    let xPos;
    let textData = [];
    if (type === "linear") {
        xPos = svgWidth * 0.05 + (val - start) * svgWidth * 0.9 / (end - start);
        textData = [
            {"x": svgWidth * 0.05, "y": 40, "text": start.toFixed(1)},
            {"x": svgWidth * 0.23, "y": 40, "text": (start + (end - start) / 5).toFixed(1)},
            {"x": svgWidth * 0.41, "y": 40, "text": (start + (end - start) * 2 / 5).toFixed(1)},
            {"x": svgWidth * 0.59, "y": 40, "text": (start + (end - start) * 3 / 5).toFixed(1)},
            {"x": svgWidth * 0.77, "y": 40, "text": (start + (end - start) * 4 / 5).toFixed(1)},
            {"x": svgWidth * 0.95, "y": 40, "text": end.toFixed(1)}];
    } else if (type === "log") {
        xPos = svgWidth * 0.05 + (Math.log10(val) - start) * svgWidth * 0.9 / (end - start);
        for (let i = start; i < 0; i++) {
            if (i !== -1) textData.push({"x": svgWidth * (0.05 + 0.9 * (start - i) / start), "y": 40, "text": "10", "sup": i});
            else textData.push({"x": svgWidth * (0.05 + 0.9 * (start - i) / start), "y": 40, "text": "0.1"});
        }
        textData.push({"x": svgWidth * (0.9), "y": 40, "text": "1"});
    }
    // Draw text.
    let text = svgContainer.selectAll("text").data(textData).enter().append("text");
    text.attr("x", function(d) {return d.x;})
        .attr("y", function(d) {return d.y;})
        .text(function(d) {return d.text;})
        .attr("font-family", "sans-serif")
        .attr("font-size", "8pt")
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central")
        .append('tspan')
        .text(function(d) {return d.sup;})
        .style('font-size', '6pt')
        .attr('dx', '1px')
        .attr('dy', '1px')
    // Draw triangle to point to a position.
    if (val !== undefined) {
        svgContainer.append("polygon")
        .attr("points", `${xPos - 3},0 ${xPos + 3},0 ${xPos},10`)
        .style("fill", "black")
        .style("stroke", "black")
        .style("strokeWidth", "1px");
    }
}

// Global variables to store whether LOR colorbars are drawn.
let viralMutColorbarDrawn = false;
let popvarColorbarDrawn = false;

// Show viral mutation enrichment colorbars when collapse is visible.
$("#collapseViralMut").on("shown.bs.collapse", function () {
    d3.select("#viral-lor-colorbar > svg").remove();
    d3.select("#viral-pval-colorbar > svg").remove();
    if (viral_enrichment["logodds"] !== "NaN") {
        drawColorBar("viral-lor-colorbar", "RdYlBu", 64, viral_enrichment["logodds"], -5, 5, "linear");
        drawColorBar("viral-pval-colorbar", "Greys", 64, viral_enrichment["pvalue"], -5, 0, "log");
    } else {
        $("#viral-lor-colorbar")
            .text("Log odds ratio unavailable")
            .css("font-size", "8pt")
            .css("height", "45px")
            .css("line-height", "45px")
            .addClass("text-center");
        $("#viral-pval-colorbar")
            .text("P-value unavailable")
            .css("font-size", "8pt")
            .css("height", "45px")
            .css("line-height", "45px")
            .addClass("text-center");
    }
    viralMutColorbarDrawn = true;
});

// Show human popvar enrichment colorbars when collapse is visible.
$("#collapsePopVar").on("shown.bs.collapse", function () {
    d3.select("#human-lor-colorbar > svg").remove();
    d3.select("#human-pval-colorbar > svg").remove();
    if (human_enrichment["logodds"] !== "NaN") {
        drawColorBar("human-lor-colorbar", "RdYlBu", 64, human_enrichment["logodds"], -5, 5, "linear");
        drawColorBar("human-pval-colorbar", "Greys", 64, human_enrichment["pvalue"], -5, 0, "log");
    } else {
        $("#human-lor-colorbar")
            .text("Log odds ratio unavailable")
            .css("font-size", "8pt")
            .css("height", "45px")
            .css("line-height", "45px")
            .addClass("text-center");
        $("#human-pval-colorbar")
            .text("P-value unavailable")
            .css("font-size", "8pt")
            .css("height", "45px")
            .css("line-height", "45px")
            .addClass("text-center");
    }
    popvarColorbarDrawn = true;
});

// Function that draws a interface representation of a protein.
function drawInterface(id, protColor, interfaceColor, protLength, isInterface) {
    let svgWidth = $("#"+id).width();
    let svgContainer = d3.select("#" + id).append("svg").attr('width', svgWidth).attr('height', 50);
    let isInterfaceList = isInterface.split(';');
    let residueWidth = svgWidth / protLength;
    let residueData = [];
	residueData.push({"width": residueWidth * protLength, "height": 20, "x": residueWidth, "y": 10, "fill": protColor});
    for (let i = 0; i < protLength; i++) {
        if (isInterfaceList[i] === "1") {
			residueData.push({"width": residueWidth, "height": 20, "x": i * residueWidth, "y": 10, "fill": interfaceColor});
		}
    }
    let rect = svgContainer.selectAll("rect").data(residueData).enter().append("rect");
    rect.attr("width", function(d) {return d.width;})
        .attr("height", function(d) {return d.height;})
        .attr("x", function(d) {return d.x;})
        .attr("y", function(d) {return d.y;})
        .attr("fill", function(d) {return d.fill;})
        .attr("opacity", 1);
}

// Function that draws a heatmap for ddG scans.
function drawHeatmap(id, tsvFile, chain, schemeName, interfaceResidues, startIndex) {
    let aaArray = ["A", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "V", "W", "Y"];
    let svgWidth = $("#"+id).width();
    let squareLength = svgWidth / 24;
    let svgHeight = (interfaceResidues.length + 2) * squareLength;
    let svgContainer = d3.select("#" + id).append("svg").attr('width', svgWidth).attr('height', svgHeight)
        .attr('height', (interfaceResidues.length + 4) * squareLength);

    let tsvString = "";
    $.ajax({
        url: tsvFile,
        type: 'get',
        async: false,
        success: function(f) {
            tsvString = String(f);
        }
    });

    // Calculate min and max.
    let minddG = undefined;
    let maxddG = undefined;
    let tsvData = tsvString.split('\n');
    for (let i = 0; i < tsvData.length; i++) {
        let row = tsvData[i].split('\t');
        if (i === 0 || row[0] !== chain) continue;
        for (let j = 0; j < 20; j++) {
            let ddg = parseFloat(row[j * 3 + 3]);
            if (minddG === undefined) {
                minddG = ddg;
                maxddG = ddg;
            } else {
                if (ddg < minddG) minddG = ddg;
                if (ddg > maxddG) maxddG = ddg;
            }
        }
    }

    // Draw y-axis with different
    let a = d3.tsv(tsvFile).then(function(data) {
        // Draw x-axis with 20 amino acids.
        let x = d3.scaleBand()
            .range([0, 20 * squareLength])
            .domain(aaArray)
            .padding(0.05);
        svgContainer.append("g")
            .style("font-size", "0.6rem")
            .attr("transform", "translate(" + 2 * squareLength + "," + 2 * squareLength + ")")
            .call(d3.axisTop(x).tickSize(0))
            .select(".domain").remove();
        // Draw y-axis with all interface residues.
        let y = d3.scaleBand()
            .range([0, interfaceResidues.length * squareLength])
            .domain(interfaceResidues)
            .padding(0.05);
        svgContainer.append("g")
            .style("font-size", "0.6rem")
            .attr("transform", "translate(" + 2 * squareLength + "," + 2 * squareLength + ")")
            .call(d3.axisLeft(y).tickSize(0))
            .select(".domain").remove();
        // Build color scale
        let minddG = undefined;
        let maxddG = undefined;
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < aaArray.length; j++) {
                if (data[i]["Chain"] !== chain) continue;
                if (minddG === undefined | minddG > parseFloat(data[i][`ddG_${aaArray[j]}_z`])) minddG = parseFloat(data[i][`ddG_${aaArray[j]}_z`]);
                if (maxddG === undefined | maxddG < parseFloat(data[i][`ddG_${aaArray[j]}_z`])) maxddG = parseFloat(data[i][`ddG_${aaArray[j]}_z`]);
            }
        }
        let minColorVal = maxddG;
        let maxColorVal = minddG;
        let colors = d3.scaleSequential().interpolator(d3[`interpolate${schemeName}`]).domain([3, -3]);
        // Create a tooltip
        let tooltip = d3.select("#" + id).append("div").style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid black 1px")
            .style("border-radius", "5px")
            .style("padding", "5px");
        // Functions to control the tooltip
        let mouseOver = function(d) {
            tooltip.style("opacity", 1);
            d3.select(this).style("stroke", "black").style("stroke-width", "2px").style("opacity", 1);
        };
        let mouseMove = function(d) {
            tooltip.html(d.mutation + "<br>&#x394;&#x394;G=" + d.value + "<br>Z=" + d.value_z)
                .style("left", (d3.mouse(this)[0] + 30) + "px")
                .style("top", (d3.mouse(this)[1]) + "px")
                .style("font-size", "0.8rem");
        };
        let mouseLeave = function(d) {
            tooltip.style("opacity", 0);
            d3.select(this).style("stroke", "none").style("opacity", 1);
        };
        // Add the squares
        let squareData = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i]["Chain"] === chain) {
                for (let j = 0; j < aaArray.length; j++) {
                    if (data[i]["Ref"] !== aaArray[j])
                        squareData.push({"x": (j+2) * squareLength, "y": (i - startIndex + 2) * squareLength, "width": squareLength,
                            "height": squareLength, "fill": colors(data[i][`ddG_${aaArray[j]}_z`]),
                            "mutation": data[i]["Ref"] + interfaceResidues[i - startIndex] + aaArray[j],
                            "value": parseFloat(data[i][`ddG_${aaArray[j]}_avg`]).toFixed(2),
                            "value_z": parseFloat(data[i][`ddG_${aaArray[j]}_z`]).toFixed(1),
                            "id": id.split("-")[0] + "-" + data[i]["Ref"] + data[i]["Pos"] + aaArray[j]});
                    else
                        squareData.push({"x": (j+2) * squareLength, "y": (i - startIndex + 2) * squareLength, "width": squareLength,
                            "height": squareLength, "fill": "#e3e3e3", "mutation": "Wild Type",
                            "value": "NaN", "value_z": "NaN", "id": id.split("-")[0] + "-" + data[i]["Ref"] + data[i]["Pos"] + aaArray[j]});
                        // squareData.push({"x": (j+2) * squareLength, "y": (i - startIndex + 2) * squareLength, "width": squareLength,
                        //     "height": squareLength, "fill": "url(#diagonalHatch)"});
                }
            }
        }
        let square = svgContainer.selectAll("rect").data(squareData).enter().append("rect");
        square.attr("x", function(d) {return d.x;})
            .attr("y", function(d) {return d.y;})
            .attr("rx", 4)
            .attr("ry", 4)
            .attr("width", function(d) {return d.width;})
            .attr("height", function(d) {return d.height;})
            .attr("fill", function(d) {return d.fill;})
            .attr("opacity", 1)
            .attr("stroke-width", 4)
            .attr("stroke", "none")
            .attr("id", function(d) {return d.id;})
            .on("mouseover", mouseOver)
            .on("mousemove", mouseMove)
            .on("mouseleave", mouseLeave);
    });
    return [3, -3];
}

// Global variables to store whether ddG heatmaps are drawn.
let viralHeatmapDrawn = false;
let humanHeatmapDrawn = false;
let viralMutHighlighted = undefined;
let viralMutColorDict = {};
let humanPopHighlighted = undefined;
let humanVarColorDict = {};

let all_viral_muts = [];
for (let i = 0; i < viral_muts.length; i++) {
    all_viral_muts.push(viral_muts[i]["covid_aa"] + viral_muts[i]["covid_pos"].toString() + viral_muts[i]["sars_aa"]);
}

let all_human_vars = [];
for (let i = 0; i < popvars.length; i++) {
    all_human_vars.push(popvars[i]["aa_ref"] + popvars[i]["aa_pos"].toString() + popvars[i]["aa_alt"]);
}

function highlightViral() {
    if(viralMutHighlighted === undefined) return;
    if(!viralMutHighlighted) {
        d3.select("#viral-ddG-heatmap").selectAll("svg").selectAll("rect")
            .filter(function (d) {return d.mutation !== undefined})
            .filter(function (d) {
                viralMutColorDict[d.mutation] = d.fill;
                return all_viral_muts.indexOf(d.mutation) === -1;
            })
            .attr("fill", "#e3e3e3");
        viralMutHighlighted = true;
    } else {
        d3.select("#viral-ddG-heatmap").selectAll("svg").selectAll("rect")
            .filter(function (d) {return d.mutation !== undefined})
            .filter(function (d) {return all_viral_muts.indexOf(d.mutation) === -1;})
            .attr("fill", function (d) {return viralMutColorDict[d.mutation]});
        viralMutHighlighted = false;
    }
}

function reHighlightViral() {
    if (d3.select("#viral-ddG-heatmap").selectAll("svg").selectAll("rect")._groups[0].length === 0) {
        window.setTimeout(reHighlightViral, 100);
    } else {
        d3.select("#viral-ddG-heatmap").selectAll("svg").selectAll("rect")
            .filter(function (d) {return d.mutation !== undefined})
            .filter(function (d) {
                viralMutColorDict[d.mutation] = d.fill;
                return all_viral_muts.indexOf(d.mutation) === -1;
            })
            .attr("fill", "#e3e3e3");
    }
}

function highlightHuman() {
    if(humanPopHighlighted === undefined) return;
    if(!humanPopHighlighted) {
        d3.select("#human-ddG-heatmap").selectAll("svg").selectAll("rect")
            .filter(function (d) {return d.mutation !== undefined})
            .filter(function (d) {
                humanVarColorDict[d.mutation] = d.fill;
                return all_human_vars.indexOf(d.mutation) === -1;
            })
            .attr("fill", "#e3e3e3");
        humanPopHighlighted = true;
    } else {
        d3.select("#human-ddG-heatmap").selectAll("svg").selectAll("rect")
            .filter(function (d) {return d.mutation !== undefined})
            .filter(function (d) {return all_human_vars.indexOf(d.mutation) === -1;})
            .attr("fill", function (d) {return humanVarColorDict[d.mutation]});
        humanPopHighlighted = false;
    }
}

function reHighlightHuman() {
    if (d3.select("#human-ddG-heatmap").selectAll("svg").selectAll("rect")._groups[0].length === 0) {
        window.setTimeout(reHighlightHuman, 100);
    } else {
        d3.select("#human-ddG-heatmap").selectAll("svg").selectAll("rect")
            .filter(function (d) {return d.mutation !== undefined})
            .filter(function (d) {
                humanVarColorDict[d.mutation] = d.fill;
                return all_human_vars.indexOf(d.mutation) === -1;
            })
            .attr("fill", "#e3e3e3");
    }
}

// Check if a file exists on the server.
function doesFileExist(urlToFile) {
    let xhr = new XMLHttpRequest();
    xhr.open('HEAD', urlToFile, true);
    xhr.send();
    return xhr.status !== 404;
}

// Draw viral ddG heatmap when collapse is visible.
$("#collapseDDG").on("shown.bs.collapse", function () {
    d3.select("#viral-ddG-colorbar > svg").remove();
    d3.select("#viral-ddG-heatmap > svg").remove();
    if (doesFileExist(staticPrefix + "ddg_data/" + interactionString + "_1_Mean.txt")) {
        $("#viral-ddG-heatmap").removeAttr("hidden");
        let a = drawHeatmap("viral-ddG-heatmap", staticPrefix + "ddg_data/" + interactionString + "_1_Mean.txt",
            "A", "RdYlBu", itf_docking_viral, 0, 3);
        $("#viral-ddG-highlight-btn").removeAttr("hidden");
        $("#color-by-viral-ddG-btn").removeAttr("hidden");
        // Draw colorbar.
        $("#viral-ddG-colorbar-outer-div").removeAttr("hidden");
        drawColorBar("viral-ddG-colorbar", "RdYlBu", 64, undefined, a[0], a[1], "linear");
        if (viralMutHighlighted === undefined) {viralMutHighlighted = false;}
        else if (viralMutHighlighted) reHighlightViral();
    } else {
        $("#viral-heatmap-altdiv").removeAttr("hidden");
        $("#viral-heatmap-altdiv").text("No ddG information available for this interaction.");
    }
    viralHeatmapDrawn = true;
});

// Draw human ddG heatmap when collapse is visible.
$("#collapseHumanddG").on("shown.bs.collapse", function () {
    d3.select("#human-ddG-colorbar > svg").remove();
    d3.select("#human-ddG-heatmap > svg").remove();
    if (doesFileExist(staticPrefix + "ddg_data/" + interactionString + "_1_Mean.txt")) {
        $("#human-ddG-heatmap").removeAttr("hidden");
        a = drawHeatmap("human-ddG-heatmap", staticPrefix + "ddg_data/" + interactionString + "_1_Mean.txt",
            "B", "RdYlGn", itf_docking_human, itf_docking_viral.length, 3);
        $("#human-ddG-highlight-btn").removeAttr("hidden");
        $("#color-by-human-ddG-btn").removeAttr("hidden");
        // Draw colorbar.
        $("#human-ddG-colorbar-outer-div").removeAttr("hidden");
        drawColorBar("human-ddG-colorbar", "RdYlGn", 64, undefined, a[0], a[1], "linear");
        if (humanPopHighlighted === undefined) {humanPopHighlighted = false;}
        else if (humanPopHighlighted) reHighlightHuman();
    } else {
        $("#human-heatmap-altdiv").removeAttr("hidden");
        $("#human-heatmap-altdiv").text("No ddG information available for this interaction.")
    }
    humanHeatmapDrawn = true;
});

function loadDockedLigands() {
    let ligandDataList = [];
    for (let i = 0; i < drugs.length; i++) {
        if (doesFileExist(staticPrefix + "docked_ligands/" + human_info["id"] + "_" + drugs[i]["name"] + ".pdb",)) {
            let tmpDataDict = {
                "name": i.toString(),
                "type": "url",
                "value": staticPrefix + "docked_ligands/" + human_info["id"] + "_" + drugs[i]["name"] + ".pdb",
                "loadFx": window["loadDockedLigand"],
            };
            ligandDataList.push(tmpDataDict);
        } else ligandDataList.push({});
    }
    NGL.specialOps.multiLoader("viewport2", ligandDataList, "#ffffff", 0)
}

$("#collapseDrugs").on("shown.bs.collapse", function() {
    if (drugs.length > 0) loadDockedLigands();
});

// Highlight drug and show the corresponding chemical structure.
function highlightDrug(trDiv) {
    console.log($(trDiv).index());
    $("tbody tr").removeClass("drug-highlight");
    $(trDiv).addClass("drug-highlight");
    $("#drug-img").attr("src",staticPrefix + "drug_images/" + trDiv.id.slice(5) + ".svg");
    NGL.specialOps.load($(trDiv).index(), false, "viewport2");
}

// Show structure after loading page.
$(document).ready(function() {
    // Set min-height and min-width for viewports
    if (window.innerWidth > 1024) {
        if (docked.length !== 0) {
            $("#viewport-outer-div").removeAttr("hidden");
            $("#viewport").css("min-height", window.innerHeight * 0.38).css("max-height", window.innerHeight * 0.38);
            $("#infobox").css("height", window.innerHeight * 0.38);
            showingDocked = true;
        }
        else {
            $("#viral-viewport-outer-div").removeAttr("hidden");
            $("#human-viewport-outer-div").removeAttr("hidden");
            $("#viral-viewport").css("min-height", window.innerHeight * 0.25).css("max-height", window.innerHeight * 0.25);
            $("#human-viewport").css("min-height", window.innerHeight * 0.25).css("max-height", window.innerHeight * 0.25);
            $("#infobox").css("height", window.innerHeight * 0.25);
        }
    } else {
        if (docked.length !== 0) {
            $("#viewport-outer-div").removeAttr("hidden");
            $("#viewport").css("min-height", window.innerHeight * 0.28).css("max-height", window.innerHeight * 0.28);
            $("#infobox").css("height", window.innerHeight * 0.28);
            showingDocked = true;
        }
        else {
            $("#viral-viewport-outer-div").removeAttr("hidden");
            $("#human-viewport-outer-div").removeAttr("hidden");
            $("#viral-viewport").css("min-height", window.innerHeight * 0.2).css("max-height", window.innerHeight * 0.2);
            $("#human-viewport").css("min-height", window.innerHeight * 0.2).css("max-height", window.innerHeight * 0.2);
            $("#infobox").css("height", window.innerHeight * 0.2);
        }
    }
    if (docked.length > 0) {
        showDocked();
        $("#toggle-row").removeAttr("hidden");
        $("#switch-docked-single").removeAttr("hidden");
    }
    else showSingle();
    for (let i=0; i<viral_intsim.length; i++){
		drawInterface("viral-interface-" + i, "#9ecae1", "#08519c", viral_info["length"], viral_intsim[i]["ires_mask"]);
	}
	for (let i=0; i<human_intsim.length; i++){
		drawInterface("human-interface-" + i, "#a1d99b", "#006d2c", human_info["length"], human_intsim[i]["ires_mask"]);
	}

	$("#viral-res-table").css("max-height", $("#infobox").innerHeight() - $("#residue-nav").innerHeight() - $("#toggle-row").innerHeight() - 45);
    $("#human-res-table").css("max-height", $("#infobox").innerHeight() - $("#residue-nav").innerHeight() - $("#toggle-row").innerHeight() - 45);
    $("#viral-res-table").removeAttr("hidden");
    $("#human-res-table").removeAttr("hidden");
});

// Handles window resize.
$(window).on("resize", function() {
    if (showingDocked) {
        if (window.innerWidth > 1024) {
            $("#viewport").css("min-height", window.innerHeight * 0.38).css("max-height", window.innerHeight * 0.38);
            $("#infobox").css("height", window.innerHeight * 0.38);
        } else {
            $("#viewport").css("min-height", window.innerHeight * 0.28).css("max-height", window.innerHeight * 0.28);
            $("#infobox").css("height", window.innerHeight * 0.28);
        }
    } else {
        if (window.innerWidth > 1024) {
            $("#viral-viewport").css("min-height", window.innerHeight * 0.25).css("max-height", window.innerHeight * 0.25);
            $("#human-viewport").css("min-height", window.innerHeight * 0.25).css("max-height", window.innerHeight * 0.25);
            $("#infobox").css("height", window.innerHeight * 0.25);
        } else {
            $("#viral-viewport").css("min-height", window.innerHeight * 0.2).css("max-height", window.innerHeight * 0.2);
            $("#human-viewport").css("min-height", window.innerHeight * 0.2).css("max-height", window.innerHeight * 0.2);
            $("#infobox").css("height", window.innerHeight * 0.2);
        }
    }
    $("#viral-res-table").css("max-height", $("#infobox").innerHeight() - $("#residue-nav").innerHeight() - $("#toggle-row").innerHeight() - 45);
    $("#human-res-table").css("max-height", $("#infobox").innerHeight() - $("#residue-nav").innerHeight() - $("#toggle-row").innerHeight() - 45);

    if (viralMutColorbarDrawn){
		d3.select("#viral-lor-colorbar > svg").remove();
		d3.select("#viral-pval-colorbar > svg").remove();
		drawColorBar("viral-lor-colorbar", "RdYlBu", 64, viral_enrichment["logodds"], -5, 5, "linear");
        drawColorBar("viral-pval-colorbar", "Greys", 64, viral_enrichment["pvalue"], -5, 0, "log");
	}
	if (popvarColorbarDrawn){
		d3.select("#human-lor-colorbar > svg").remove();
		d3.select("#human-pval-colorbar > svg").remove();
		drawColorBar("human-lor-colorbar", "RdYlBu", 64, human_enrichment["logodds"], -5, 5, "linear");
        drawColorBar("human-pval-colorbar", "Greys", 64, human_enrichment["pvalue"], -5, 0, "log");
	}
	if (viralHeatmapDrawn){
		d3.select("#viral-ddG-colorbar > svg").remove();
		d3.select("#viral-ddG-heatmap > svg").remove();
		let a = drawHeatmap("viral-ddG-heatmap", staticPrefix + "ddg_data/" + interactionString + "_1_Mean.txt",
        "A", "RdYlBu", itf_docking_viral, 0, 3);
		drawColorBar("viral-ddG-colorbar", "RdYlBu", 64, undefined, a[0], a[1], "linear");
		if (viralMutHighlighted === true) reHighlightViral();
	}
	if (humanHeatmapDrawn){
	    d3.select("#human-ddG-colorbar > svg").remove();
		d3.select("#human-ddG-heatmap > svg").remove();
		let a = drawHeatmap("human-ddG-heatmap", staticPrefix + "ddg_data/" + interactionString + "_1_Mean.txt",
            "B", "RdYlGn", itf_docking_human, itf_docking_viral.length, 3);
		drawColorBar("human-ddG-colorbar", "RdYlGn", 64, undefined, a[0], a[1], "linear");
		if (humanPopHighlighted === true) reHighlightHuman();
	}
});
