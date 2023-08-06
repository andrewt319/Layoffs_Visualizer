function finalproject(){
    d3.csv('data/layoffs_per_industry.csv').then(function(data) {
        data.forEach(function(d) {
            d.total_laid_off = parseInt(d.total_laid_off);
          });
        console.log(data);
        tableVis(data);
    })

    d3.csv('data/top_5.csv').then(function(data) {
        networkVis(data);
    })

    d3.csv('data/us_layoffs.csv').then(function(data) {
        data.forEach(function(d) {
            d.total_laid_off = parseInt(d.total_laid_off);
          });
        console.log(data);
        geometryVis(data)
    })
}


let tableVis = function(data) {
    // Chart dimensions
    var margin = { top: 40, right: 20, bottom: 90, left: 70 };
    var width = 900;
    var height = 800;

    data.sort((a, b) => a.total_laid_off - b.total_laid_off);

    // Create SVG element
    var svg = d3.select("#table_plot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // X-axis scale
    var xScale = d3.scaleBand()
        .domain(data.map(function (d) { return d.industry; }))
        .range([0, width])
        .padding(0.1);

    // Y-axis scale
    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) { return d.total_laid_off; }) + 2000])
        .range([height, 0]);

    // X-axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .attr("text-anchor", "end")
        .attr("dy", "0.2em")
        .attr("dx", "-0.6em");

    // Y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Bars
    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return xScale(d.industry); })
        .attr("y", function (d) { return yScale(d.total_laid_off); })
        .attr("width", xScale.bandwidth())
        .attr("height", function (d) { return height - yScale(d.total_laid_off) })
        .attr("fill", "navy")
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    const tooltip = d3.select("#table_plot")
        .append("div")
        .style("position", "absolute")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "2px")
        .style("border-radius", "5px")
        .style("padding", "5px")

  // Function to handle mouseover event
  function handleMouseOver(event, d) {
    // Show tooltip
    tooltip
    .style("opacity", 1)
    .style("stroke", "black")
    .style("visibility", "visible")
    .html(d.industry + ': ' + d.total_laid_off)
    .style("top", (event.pageY) + "px")
    .style("left", (event.pageX) + "px")
  }

  // Function to handle mouseout event
  function handleMouseOut() {
    // Hide tooltip
    tooltip.text('')
    tooltip.style('visibility', 'hidden')
  }

    // Axes labels and title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle")
        .text("Industry");

    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text("Total Number of Layoffs");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "25px")
        .text("Layoffs by Industry");
}

let networkVis = function(data) {
  const linkColor = "gray";
  const companyColor = "lightseagreen";
  const industryColor = "lightblue"

  const width = 900;
  const height = 1000;

  const industries = ['Aerospace',
    'Construction',
    'Consumer',
    'Crypto',
    'Data',
    'Education',
    'Energy',
    'Finance',
    'Fitness',
    'Food',
    'HR',
    'Hardware',
    'Healthcare',
    'Infrastructure',
    'Legal',
    'Logistics',
    'Manufacturing',
    'Marketing',
    'Media',
    'Other',
    'Product',
    'Real Estate',
    'Recruiting',
    'Retail',
    'Sales',
    'Security',
    'Support',
    'Transportation',
    'Travel'];

  // Set up SVG container and zoom behavior
  const svg = d3.select("#network_plot")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const zoom = d3.zoom()
    .scaleExtent([0.5, 3])
    .on("zoom", zoomed);

  const container = svg.append("g");

  svg.call(zoom);

  function zoomed(event) {
    container.attr("transform", event.transform);
  }

  // Load the data
  d3.json("data/network.json").then(data => {
    const { nodes, links } = data;

    // Create a scale for link thickness
    const linkThicknessScale = d3.scaleLinear()
      .domain(d3.extent(links, d => d.value))
      .range([1, 10]);

    // Create the force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-7))
      .force("center", d3.forceCenter(svg.attr("width") / 2, svg.attr("height") / 2));

    // Create the links as curved paths
    const link = container.append("g")
      .selectAll("path")
      .data(links)
      .enter()
      .append("path")
      .attr("stroke", linkColor)
      .attr("stroke-width", d => linkThicknessScale(d.value))
      .attr("fill", "none")
      .attr("d", linkArc); 

    const linkOpposite = container.append("g")
      .selectAll("path")
      .data(links)
      .enter()
      .append("path")
      .attr("stroke", linkColor)
      .attr("stroke-width", d => linkThicknessScale(d.value))
      .attr("fill", "none")
      .attr("d", linkArcOpposite);

    // Create the nodes with labels
    const node = container.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", d => industries.includes(d.name) ? 15 : 8)
      .style("fill", d => industries.includes(d.name) ? industryColor : companyColor);

    node.append("title")
      .text(d => d.name);

    const label = container.append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .text(d => d.name)
      .style("font-size", d => industries.includes(d.name) ? "10px" : "6px")
      .style("font-weight", d => industries.includes(d.name) ? "bold" : "normal")
      .attr("dx", -5)
      .attr("dy", 2);

    simulation.force("collide", d3.forceCollide().radius(20)); // Adjust the radius as needed

    // Update node and link positions during simulation
    simulation.on("tick", () => {
      link.attr("d", linkArc); // Update the curved paths on tick
      linkOpposite.attr("d", linkArcOpposite);
      node.attr("cx", d => d.x).attr("cy", d => d.y);
      label.attr("x", d => d.x).attr("y", d => d.y);
    });
  });

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 20)
    .text("Top 5 Companies with the Most Layoffs Per Industry")
    .style("text-anchor", "middle")
    .style("font-size", "25px");

  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - 120}, ${height - 200})`);

  // Industry legend item
  legend.append("circle")
    .attr("cx", 10)
    .attr("cy", 10)
    .attr("r", 6)
    .style("fill", industryColor);

  legend.append("text")
    .attr("x", 20)
    .attr("y", 10)
    .text("Industry")
    .attr("alignment-baseline", "middle");

  // Company legend item
  legend.append("circle")
    .attr("cx", 10)
    .attr("cy", 30)
    .attr("r", 6)
    .style("fill", companyColor);

  legend.append("text")
    .attr("x", 20)
    .attr("y", 30)
    .text("Company")
    .attr("alignment-baseline", "middle");

  // Function to generate curved links
  let linkArc = function(d) {
    const dx = d.target.x - d.source.x;
    const dy = d.target.y - d.source.y;
    const dr = Math.sqrt(dx * dx + dy * dy);
    return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
  }

  let linkArcOpposite = function(d) {
    const dx = d.source.x - d.target.x; 
    const dy = d.source.y - d.target.y; 
    const dr = Math.sqrt(dx * dx + dy * dy); 
    return `M${d.target.x},${d.target.y}A${dr},${dr} 0 0,1 ${d.source.x},${d.source.y}`;
  }
}


let geometryVis = function(data) {
    let stateSym = {
        AZ: 'Arizona',
        AL: 'Alabama',
        AK: 'Alaska',
        AR: 'Arkansas',
        CA: 'California',
        CO: 'Colorado',
        CT: 'Connecticut',
        DC: 'District of Columbia',
        DE: 'Delaware',
        FL: 'Florida',
        GA: 'Georgia',
        HI: 'Hawaii',
        ID: 'Idaho',
        IL: 'Illinois',
        IN: 'Indiana',
        IA: 'Iowa',
        KS: 'Kansas',
        KY: 'Kentucky',
        LA: 'Louisiana',
        ME: 'Maine',
        MD: 'Maryland',
        MA: 'Massachusetts',
        MI: 'Michigan',
        MN: 'Minnesota',
        MS: 'Mississippi',
        MO: 'Missouri',
        MT: 'Montana',
        NE: 'Nebraska',
        NV: 'Nevada',
        NH: 'New Hampshire',
        NJ: 'New Jersey',
        NM: 'New Mexico',
        NY: 'New York',
        NC: 'North Carolina',
        ND: 'North Dakota',
        OH: 'Ohio',
        OK: 'Oklahoma',
        OR: 'Oregon',
        PA: 'Pennsylvania',
        RI: 'Rhode Island',
        SC: 'South Carolina',
        SD: 'South Dakota',
        TN: 'Tennessee',
        TX: 'Texas',
        UT: 'Utah',
        VT: 'Vermont',
        VA: 'Virginia',
        WA: 'Washington',
        WV: 'West Virginia',
        WI: 'Wisconsin',
        WY: 'Wyoming'
    };

    var width = 900;
  var height = 800;

  // Append SVG container
  var svg = d3
    .select("#geometric_plot")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

    var layoff_data = {};

data.forEach(function (item) {
      var state = item.location;
  var total_laid_off = parseFloat(item['total_laid_off']);
    layoff_data[state] = total_laid_off
});
    // Load US states data
  d3.json("data/us-states.json")
  .then(function(json) {
    json.features.forEach(function(feature) {
      var state = stateSym[feature.properties.name];
      var total_laid_off = layoff_data[state] || 0;
      feature.properties.total_laid_off = total_laid_off;
    });
    console.log(json.features);

    // Define the color scale for the sales data
    var total_laid_off = Math.max(...json.features.map(function(feature) {
      return feature.properties.total_laid_off;
    }));
    var colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([1, Math.log(total_laid_off)]);

    // Create the map projection
    var projection = d3.geoAlbersUsa().fitSize([width, height], json);

    // Create a path generator
    var path = d3.geoPath().projection(projection);

    // Append the map to the SVG
    var map = svg
      .selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", function(d) {
        var total_laid_off = d.properties.total_laid_off || 0
        return colorScale(Math.log(total_laid_off + 1));
      })
      .style("stroke", "black")
      .style("stroke-width", "1")
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);

      const tooltip = d3.select("#geometric_plot")
      .append("div")
      .style("position", "absolute")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")

// Function to handle mouseover event
function handleMouseOver(event, d) {
  var state = stateSym[d.properties.name]
  // Show tooltip
  tooltip
  .style("opacity", 1)
  .style("stroke", "black")
  .style("visibility", "visible")
  .html(state + ': ' + layoff_data[state])
  .style("top", (event.pageY) + "px")
  .style("left", (event.pageX) + "px")
}

// Function to handle mouseout event
function handleMouseOut() {
  // Hide tooltip
  tooltip.text('')
  tooltip.style('visibility', 'hidden')
}

    // Add legend
    var legendWidth = 400;
    var legendHeight = 20;

    var legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(" + (width - legendWidth - 20) + "," + (height - legendHeight - 40) + ")");


    var legendScale = d3
      .scaleLinear()
      .domain([1, Math.log(total_laid_off)])
      .range([0, legendWidth]);

    var legendAxis = d3.axisBottom(legendScale)
      .ticks(10)
      .tickFormat(function(d) {
        return  Math.exp(d).toFixed(0);
      });

    legend.append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)");

    legend.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + legendHeight + ")")
      .call(legendAxis);

    // Add gradient for legend
    var gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScale(1));

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScale(Math.log(total_laid_off)));

    // Add title to the legend
    legend.append("text")
      .attr("class", "legend-title")
      .attr("x", 0)
      .attr("y", -5)
      .text("Number of Layoffs");

    // Add title to the map
    svg.append("text")
      .attr("class", "map-title")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "25px")
      .text("Layoff Distribution by State");
  })
  .catch(function(error) {
    console.log("Error loading JSON data: " + error);
  });
}
