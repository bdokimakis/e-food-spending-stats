$(document).ready(function(){
	$('.wrapper-user-orders .container').prepend("<div id='chartContainer' style='margin-bottom: 20px; border: 5px solid; text-align: center; height: 300px; width: 100%;'><img src='" + chrome.extension.getURL('loader.gif') + "'><div>Loading order data...</div></div>");
	
	window.setTimeout(function() { go(); }, 1000);
	
	var data = new Array;
	var total = 0;
	var hasNext = 1;
	var offset = 0;
	
	function go () {
		
		while (hasNext) {
			$.ajax({
				url: 'https://www.e-food.gr/api/orders/get?offset=' + offset,
				success: function (result) {
					hasNext = result.has_next;
					$.each(result.orders, function(index, value) {
						if (value.status == "accepted") {
							total += value.price;
							
							var dateParts = value.submission_date.split("/");
							var dt = new Date(parseInt(dateParts[2], 10), parseInt(dateParts[1], 10) - 1, 1);
													
							var found = false;
							
							$.each(data, function(index, value2) {
								tempDate = new Date(value2['x']);
								if (tempDate.getMonth() == dt.getMonth() && tempDate.getFullYear() == dt.getFullYear()) {
									data[index]['y'] += value.price;
									found = true;
								}
							});
							
							if (!found) {
								data.push({ x: dt, y: value.price});
							}
						}
					});
				},
				async: false
			});
			
			offset += 50;
		}
		
		$('.wrapper-user-orders .container > div:first-child').after("<h1 style='margin-bottom: 20px; text-align: center; color: red;'>Total: €" + Math.round(total * 100) / 100 + "</h1>");
		$('.wrapper-user-orders .container > div:first-child').after("<h1 style='margin-bottom: 20px; text-align: center; color: red;'>Monthly average: €" + Math.round(total / data.length * 100) / 100 + "</h1>");
		
		var chart = new CanvasJS.Chart("chartContainer",
			{
			  title:{
				text: "Money eaten (sic) over time"
			},
			axisX:{
				intervalType: "month",
				valueFormatString: "MMM"
			},
			axisY: {
				title: "Orders Value"
			},
			data: [
				{        
					type: "spline",
					xValueFormatString: "MMM, YYYY",
					yValueFormatString: "€###.##",
					dataPoints: data
				}
			]
		});

		chart.render();
	}			
});