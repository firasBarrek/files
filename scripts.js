   //change the application url and the server url here
   var app_url = 'http://10.241.109.147:8000';
   var server_url = 'https://10.241.109.147:5000';


   var tag_value;
   var uri_value;
   var complexite_value;
   var fraicheur_value;
   var contenus_value;
   var finalArray = []
   var tri_vote;
   var tri_value = '';

   function getMax(arr) {
    var max;
    var res = {}
    for(var key in arr) {
    //var value = arr[key];
	if (!max || parseInt(arr[key]) > parseInt(max)){
            max = arr[key];
	    res.max = max;
	    res.key = key
	}
    }
    return res;
   }

   function getMoyenne(arr){
   var somme = 0;
   var indices = 0;
	for(var i=0; i<arr.length; i++) {
	   if(arr[i]!=''){
		somme = somme + arr[i];
		indices = indices + 1;
	   }
	}
    var moyenne = Math.round(somme/indices);
    return moyenne;
   }

   var component = function(params){
    return "<div class='panel panel-primary' style='border-color: #000;'><div style='background-color: #000;background-image: none;' class='panel-heading'><a href="+params.url+" style='color: #ffffff;' data-toggle='tooltip' title="+params.url+" target='_blanck'>"+params.title+"</a><span style='float:right;display:inline-flex;'><span>Intérêt : "+params.moyenneRate+"/5</span><div class='rating'><span class='item"+params.item+"rating5'>☆</span><span class='item"+params.item+"rating4'>☆</span><span class='item"+params.item+"rating3'>☆</span><span class='item"+params.item+"rating2'>☆</span><span class='item"+params.item+"rating1'>☆</span></div><span></div><div class='panel-body'><p>"+params.description+"</p><span style='margin-right: 5%;'><b style='color:#ff6600;'>Complexité : </b>"+params.maxComplexite+"</span><span style='margin-right:5%;'><b style='color:#ff6600;'>Fraicheur : </b>"+params.maxFraicheur+"</span><span style='margin-right: 5%;'><b style='color:#ff6600;'>Type de contenus : </b>"+params.maxTypes+"</span></div><div class='panel-footer'></div></div>";
   }

	var numDaysBetween = function(d1, d2) {
	  var diff = Math.abs(d1.getTime() - d2.getTime());
	  return diff / (1000 * 60 * 60 * 24);
	}; 

   $( document ).ready(function() {
  
	$.get(app_url+'/top_tags', function(data){
	    console.log('data = '+JSON.stringify(data));
                $("#top_tags").html("");
                data.sort(function(a,b){return b.count - a.count});
                var i = 0;
                data.forEach(function(element){
		if(i<5)
                $("#top_tags").append("<li style='padding:5px;margin-right:30px;border:2px solid #7d7d7d;border-radius:5px;'>"+element.tag+" ("+element.count+")</li>");
                i++;
		});
	});

	$.get(app_url+'/top_uris', function(data){
	    console.log('data = '+JSON.stringify(data));
                $("#top_uris").html("");
                data.sort(function(a,b){return b.count - a.count});
                var i = 0;
                data.forEach(function(element){
		if(i<5)
                $("#top_uris").append("<li style='margin-right:30px;'><a style='color:#ff6600;' target='_blanck' href="+element.uri+">"+element.uri+"</a> ("+element.count+")</li>");
                i++;
		});
	});

 	$.ajax({
         url: server_url+'/api/search',
         data: {},
         type: 'GET',
         beforeSend: function(xhr){
		xhr.setRequestHeader('Authorization', 'Bearer 6879-UqTTpiixdPVScWsCpYwKZoHTGuA3VZ2uE2HOKYDLRu8');	
	 },
         success: function(data) {
                 var i = 0;
		 var groupedUri = _.groupBy(data.rows, function(d){return d.uri});
		 var sortedTags = [];
                 var TagsArray;
		 var object;
		 var last15days;
                 //console.log(JSON.stringify(groupedUri));
		 for (var uri in groupedUri) {
		   TagsArray = [];
		   object = {};
		   last15days = 'false';
  		   groupedUri[uri].forEach(function(element){
			if(last15days == 'false'){
     			var d1 = new Date();
     			var d2 = new Date(element.updated);
     			var diff = numDaysBetween(d1, d2);
     			if(diff<=15){ 
				last15days = 'true';
			 }
			}
			if(last15days == 'true'){
		        object.url = uri
			TagsArray.push(element.tags.length);
		        }
		   })
		var maxTags = getMax(TagsArray);
		object.maxTags = maxTags.max;
                if(object!={})
		sortedTags.push(object);
		}
		sortedTags.sort(function (a, b) {
				return b.maxTags - a.maxTags;	  
		});
                sortedTags.forEach(function(element){
		if(i<5){
		if(element.url.substring(element.url.length-1, element.url.length)=="/"){element.url = element.url.slice(0, -1);}
                $("#top_annotated").append("<li style='margin-right:30px;'><a style='color:#ff6600;' target='_blanck' href="+element.url+">"+element.url+"</a></li>");
                i++;
		}
		});
	}
      });

    var displayRate = function(rate,id){
          $('.item'+id+'rating'+rate).addClass('rating_selected'); 
    }

     var displayResult = function(tri_value,finalArray){
		$("#element").html("");
                $("#element").html("<p><b>Total résultats </b>"+finalArray.length+
				   "<button onclick='tri_vote()' style='float:right;margin-left:20px;'>"+
				   "<i class='glyphicon glyphicon-sort'></i></button></p>");
		var item = 0; 
		if(tri_value != ''){
		   finalArray.sort(function (a, b) {
			if(tri_value == 'asc'){
			    	return a.moyenneRate - b.moyenneRate;
			}else{
				return b.moyenneRate - a.moyenneRate;
			}	  
		 });		 
			finalArray.forEach(function(elem){
                         item++ ;
			 if(elem.url.substring(elem.url.length-1, elem.url.length)=="/"){elem.url = elem.url.slice(0, -1);}
			 //console.log(elem);
			 elem.item = item;
			 $("#element").append(component(elem));
                         displayRate(elem.moyenneRate,elem.item);
			 });
		}else{
		//read from file json
		var oldUrls = [];
		var newUrls = [];
		var exist;
		var base_url;
		var obj;

		$.ajax({
			 url: app_url+'/extract',
			 data: {'type':'read'},
			 type: 'POST',
			 success: function(data) {
				console.log(data);

				if (data == ''){
				   console.log('undefined '+data);
				}else{
					oldUrls = data;
					console.log('not undefined '+data);
				}
				
				

				console.log(oldUrls.length);
				console.log(newUrls.length);
				finalArray.forEach(function(elem){
					base_url = elem.url.substring(0, elem.url.indexOf('/', 14));
					base_url = base_url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
					console.log('base_url = '+base_url)
					exist = false;
					if (oldUrls.length > 0) {
					for (var i = 0; i < oldUrls.length; i++) {
						if(oldUrls[i].url.includes(base_url)){
							exist = true;
							obj = oldUrls[i];
							break;
						}
					}
					}
					if (newUrls.length > 0) {
					for (var i = 0; i < newUrls.length; i++) {
						if(newUrls[i].url.includes(base_url)){
							exist = true;
							obj = newUrls[i];
							break;
						}
					 }
					}

					if (!exist)
					console.log('base_url = '+base_url+' && exist = '+exist);

					if (exist) {
						//elem.title =  obj.title;
						elem.description =  obj.description;
					}else{
						var encodeUrl = elem.url.substring(0, elem.url.indexOf('/', 14));
						var sendUrl = 'https://opengraph.io/api/1.1/site/'+encodeURIComponent(encodeUrl)+'?app_id=5a8ec50287efbd253e796c1a';
						console.log(sendUrl);
						$.get(sendUrl, function(err,data){
						if (err) {
							encodeUrl = encodeUrl.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
							//elem.title = encodeUrl;
							elem.description = '';
							//console.log('err '+JSON.stringify(err)+' encodeUrl = '+encodeUrl);	
						}else{
				    	console.log('data = '+JSON.stringify(data));
				    	if (data.hybridGraph.description == undefined) {
							elem.description = '';
						}else{
							elem.description = data.hybridGraph.description;
						}
				    	/*if (data.hybridGraph.title.length > 120) {
						    elem.title = data.hybridGraph.title.substring(0, 120) + "...";
						}
						else if(data.hybridGraph.title == undefined){
						    elem.title =  encodeUrl;
						}else{
							elem.title =  data.hybridGraph.title;
						}*/
						data.hybridGraph.url = data.hybridGraph.url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
						newUrls.push({'url':data.hybridGraph.url, 'title':elem.title, 'description':elem.description});
						//https://orange.csod.com
						//https://recommendations.innov.intraorange
						//http://orange-france.com.francetelecom.fr
							}	
						});
					}
				});
			  }
		    })

		setTimeout(function(){
				if (newUrls.length > 0) {
					oldUrls = oldUrls.concat(newUrls);
					console.log(JSON.stringify(oldUrls));
					$.ajax({
						 url: app_url+'/extract',
						 data: {'urls':JSON.stringify(oldUrls), 'type':'write'},
						 type: 'POST',
						 success: function(data) {
							console.log(JSON.stringify(data));
						 }
					})
				}
			 finalArray.forEach(function(elem){
             item++ ;
			 if(elem.url.substring(elem.url.length-1, elem.url.length)=="/"){elem.url = elem.url.slice(0, -1);}
			 //console.log(elem);
			 elem.item = item;
			 $("#element").append(component(elem));
                         displayRate(elem.moyenneRate,elem.item);
			 });
		 }, 3000);
		}
	}

    tri_vote =  function(){
		if(tri_value == '' || tri_value == 'asc')
		tri_value = 'desc';
		else
		tri_value = 'asc';
		displayResult(tri_value,finalArray);
		}

    var save_search_tag_historique = function(tag){
         var data = {'tag':tag}
	 $.ajax({       
	 url: app_url+'/historique',
         data: data,
         type: 'POST',
         success: function(res) {console.log('data = '+res);},
     });
    }

    var save_search_uri_historique = function(uri){
         var data = {'uri':uri}
	 $.ajax({       
	 url: app_url+'/historique',
         data: data,
         type: 'POST',
         success: function(res) {console.log('data = '+res);},
     });
    }

  $("#button_search").click(function(){
    tag_value = '';
    uri_value = '';
    tri_value = '';
    $("#index").hide();
    $("#resultat").show();
    complexite_value = $( "#selComplexite" ).val();
    fraicheur_value = $( "#selFraicheur" ).val();
    contenus_value = $( "#selContenus" ).val();
    var typeInput = $("#input_search").val();
    typeInput = typeInput.substring(0, 4);
    if(typeInput=='http'){
    uri_value = $("#input_search").val();
    }else{
    tag_value = $("#input_search").val();
    }
    var element ='';
    var data = {};
    if (tag_value != ''){
	data.tag = tag_value;
    }
    if (uri_value != ''){
	data.uri = uri_value;
    }
    if (complexite_value != ''){
	data.complexite = complexite_value;
    }
    if (fraicheur_value != ''){
	data.fraicheur = fraicheur_value;
    }
    if (contenus_value != ''){
	data.contenus = contenus_value;
    }

     $.ajax({
         url: server_url+'/api/search',
         data: data,
         type: 'GET',
         beforeSend: function(xhr){
		xhr.setRequestHeader('Authorization', 'Bearer 6879-UqTTpiixdPVScWsCpYwKZoHTGuA3VZ2uE2HOKYDLRu8');	
	 },
         success: function(data) {
                 console.log(JSON.stringify(data.rows.length));
                 if(tag_value != '' && data.total != 0){ 
			save_search_tag_historique(tag_value);
		 }
                 if(uri_value != '' && data.total != 0){
			save_search_uri_historique(uri_value);
		 }
		 var groupedUri = _.groupBy(data.rows, function(d){return d.uri});
                 finalArray = []
		 for (var uri in groupedUri) {
		   //console.log('uri '+uri);
		   var object = {}
		   object.url = uri
		   var complexites = []
		   var fraicheurs = []
		   var rates = []
		   var types = []
		   var i = 0;
  		   groupedUri[uri].forEach(function(element){
  		   	if (i==0) {
  		   	//console.log('element = '+JSON.stringify(element)+" element.title "+element.title)	
  		   	object.title = element.title;
  		   	i++;
  		    }
  		   	if(element.complexite != '')
			complexites.push(element.complexite)
			if(element.fraicheur != '')
			fraicheurs.push(element.fraicheur)
			rates.push(element.rate)
			types = types.concat(element.typesContenu);
		   })

		var occurrences_complexites = complexites.reduce(function(obj, item) {
		  obj[item] = (obj[item] || 0) + 1;
		  return obj;
		}, {});
		var occurrences_fraicheurs = fraicheurs.reduce(function(obj, item) {
		  obj[item] = (obj[item] || 0) + 1;
		  return obj;
		}, {});
		var occurrences_types = types.reduce(function(obj, item) {
		  obj[item] = (obj[item] || 0) + 1;
		  return obj;
		}, {});

		var maxComplexite = getMax(occurrences_complexites);
		var maxFraicheur = getMax(occurrences_fraicheurs);
		var maxTypes = getMax(occurrences_types);
		var moyenneRate = getMoyenne(rates);
        if(moyenneRate !== parseInt(moyenneRate, 10)){moyenneRate = 0;}
		object.maxComplexite = maxComplexite.key;
		object.maxFraicheur = maxFraicheur.key;
		object.maxTypes = maxTypes.key;
		object.moyenneRate = moyenneRate;
		finalArray.push(object);
		}		
		displayResult(tri_value,finalArray);
	}
      });
     });

});