//get csv file
d3.csv('https://query.data.world/s/4hw2f264ou3fzf42pkhp5me3bjcpj4',type).then(res=>
    {console.log('Local CSV:',res)});

//遇到NA就設定為undefined, 要不然就維持原本的字串
const parseNA = string => (string === 'NA'?undefined:string);
//日期處理
const parseDate = string => d3.timeParse('%m/%d/%Y')(string);
const parseYear = string => (string === 'NA'?undefined:string);

//數值處理
const parseNumber = string => (string === 'NA'?undefined:string);

function type(d){
    const date = parseDate(d.date);
    return{
        acousticness:parseNumber(+d.acousticness),
        artist:parseNA(d.artist),
        danceability:parseNumber(+d.danceability),
        //genre:JSON.parse(d.genre),
        energy:parseNumber(+d.energy),
        liveness:parseNumber(+d.liveness),
        loudness:parseNumber(+d.loudness),
        tempo:parseNumber(+d.tempo),
        title:parseNA(d.title),
        weeks:+d.weeks,
        date:date,
        year:parseYear(+d.year)
    }
}

//Data selection
function filterData(data){
    return data.filter(
        d => {
            return(
                   d.year > 2009 || d.year >0 &&
                   d.acousticness > 0 && d.danceability > 0 && d.energy > 0 &&
                   d.liveness > 0 && d.loudness > 0 && d.tempo > 0 &&
                   d.title && d.weeks > 0 && d.date
                );
            }
        );
    }



//取前10名

function setupCanvas(barChartData, musicClean){
    let metric = 'weeks';

    function click(){
        metric = this.dataset.name;
        const thisData = chooseData(metric, musicClean);
        update(thisData);
    }
    d3.selectAll('button').on('click',click);
    
    function update(data){
        const weeksData = chooseData('weeks',musicClean);
        console.log(data);
        //Update Scale
        xMax=d3.max(weeksData, d=>d[metric]);
        xScale_v3 =d3.scaleLinear([0, xMax],[0,chart_width]);
        yScale=d3.scaleBand().domain(weeksData.map(d=>d.title))
        .rangeRound([0, chart_height])
        .paddingInner(0.25);
        //Transition Settings
        const defaultDelay = 1000
        const transitionDelay = d3.transition().duration(defaultDelay);
        //Update axis
        xAxisDraw.transition(transitionDelay).call(xAxis.scale(xScale_v3));
        yAxisDraw.transition(transitionDelay).call(yAxis.scale(yScale));
        //Update Header
        header.select('tspan').text(`Top 10 songs_${metric}  ${metric==='acousticness'?'':''}`);
        //Update Bar
        bars.selectAll('.bar').data(weeksData, d=>d.title).join(
            enter=>{
                enter.append('rect')
                .attr('class','bar')
                .attr('x',0)
                .attr('y',d=>yScale(d.title))
                .attr('height',yScale.bandwidth())
                .style('fill','lightcyan')
                .transition(transitionDelay)
                .delay((d,i)=>i*20)
                .attr('width',d=>xScale_v3(d[metric]))
                .style('fill', 'dodgerblue') 
            },
            update=>{
                update.transition(transitionDelay)
                .delay((d,i)=>i*20)
                .attr('y',d=>yScale(d.title))
                .attr('width',d=>xScale_v3(d[metric]))
            },
            exit=>{exit.transition().duration(defaultDelay/2)
            .style('fill-opacity',0)
            .remove()
        }
        );
    }

    const svg_width=700;
    const svg_height=500;
    const chart_margin = {top:80,right:80,bottom:40,left:250};
    const chart_width = svg_width - (chart_margin.left + chart_margin.right);
    const chart_height = svg_height-(chart_margin.top + chart_margin.bottom);
    const this_svg = d3.select('.bar-chart-container').append('svg').attr('width', svg_width).attr('height',svg_height).append('g').attr('transform',`translate(${chart_margin.left},${chart_margin.top})`);
    //scale//V1.d3.extent find the max & min in revenue
    const xExtent = d3.extent(barChartData, d=>d.weeks);
    const xScale_v1 = d3.scaleLinear().domain(xExtent).range([0,chart_width]);
    //V2.0 ~ max
    let xMax=d3.max(barChartData, d=>d.weeks);
    const xScale_v2 = d3.scaleLinear().domain([0, xMax]).range([0,chart_width]);
    //V3.Short writing for v2
    let xScale_v3 =d3.scaleLinear([0,xMax],[0, chart_width]);
    let yScale=d3.scaleBand().domain(barChartData.map(d=>d.title)).rangeRound([0, chart_height]).paddingInner(0.25);

const bars = this_svg.append('g').attr('class','bars');

let header =this_svg.append('g').attr('class','bar-header').attr('transform',`translate(0,${-chart_margin.top/2})`).append('text');
header.append('tspan').text('Top 10 songs in Billboard');
header.append('tspan').text('Years:2010-2017').attr('x',0).attr('y',20).style('font-size','0.8em').style('fill','#555');

//tickSizeInner: the length of the tick lines
//tickSizeOuter: the length of the square ends of the domain path
let xAxis=d3.axisTop(xScale_v3)
            .tickSizeInner(-chart_height)
            .tickSizeOuter(0);
let xAxisDraw = this_svg.append('g')
            .attr('class','x axis')
let yAxis = d3.axisLeft(yScale)
            .tickSize(0);
let yAxisDraw = this_svg.append('g')
                .attr('class','y axis')

yAxisDraw.selectAll('text').attr('dx','-0.6em');

update(barChartData);
        //interactive
        const tip = d3.select('.tooltip');

        function mouseover(e){
            const thisBarData = d3.select(this).data()[0];
            tip.style('left',(e.clientX+15)+'px')
            .style('top',e.clientY+'px')
            .style('opacity',0.98)
            tip.select('h3').html(`${thisBarData.title}, ${thisBarData.artist}`);
            tip.select('h4').html(`${thisBarData.weeks} weeks, ${thisBarData.year}.`);
        }
        function mousemove(e){
            tip.style('left',(e.clientX+15)+'px')
            .style('top',e.clientY+'px')
            // .style('opacity',0.98)
            // .html("Hello")
        }
        function mouseout(e){
            tip.style('opacity',0)
        }
        //interactive 新增監聽
        d3.selectAll('.bar')
        .on('mouseover',mouseover)
        .on('mousemove',mousemove)
        .on('mouseout',mouseout);
}


//main

function ready(music){
    const musicClean = filterData(music);   
    const weeksData = chooseData('weeks',musicClean);
    setupCanvas(weeksData, musicClean);
}

d3.csv('data/billboard.csv', type).then(
    res => {
        ready(res);
    }
)

function chooseData(metric, musicClean){
    const thisData = musicClean.sort((a,b)=>b[metric]-a[metric]).filter((d,i)=>i<10); 
    return thisData;
}

