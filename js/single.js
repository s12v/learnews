// Translations cache
var translation = new Object();

function init()
{
	initLanguageForm();
	getRubrics();
}

function getLanguage()
{
	var lang = widget.preferences.getItem('lang'); 
	if (lang == 'auto') {
		return navigator.language;
	} else {
		return lang; 
	}
}

//Supported languages
function getLanguages()
{
  return {
      "ar": "Arabic",
      "bg": "Bulgarian",
      "ca": "Catalan",
      "zh-CHS": "Chinese Simplified",
      "zh-CHT": "Chinese Traditional",
      "cs": "Czech",
      "da": "Danish",
      "nl": "Dutch",
      "et": "Estonian",
      "fi": "Finnish",
      "fr": "French",
      "de": "German",
      "el": "Greek",
      "ht": "Haitian Creole",
      "he": "Hebrew",
      "hi": "Hindi",
      "hu": "Hungarian",
      "id": "Indonesian",
      "it": "Italian",
      "ja": "Japanese",
      "ko": "Korean",
      "lv": "Latvian",
      "lt": "Lithuanian",
      "no": "Norwegian",
      "pl": "Polish",
      "pt": "Portuguese",
      "ro": "Romanian",
      "ru": "Russian",
      "sk": "Slovak",
      "sl": "Slovenian",
      "es": "Spanish",
      "sv": "Swedish",
      "th": "Thai",
      "tr": "Turkish",
      "uk": "Ukrainian",
      "vi": "Vietnamese"                    
    };
}


function loadObject(url, callback)
{
  if (url.match(/\?/)) {
    url = url + '&';
  } else {
    url = url + '?';
  }
  url = url + 'lang=' + encodeURIComponent(getLanguage()) + '&v=' + encodeURIComponent(widget.version);
	
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.setRequestHeader("Cache-Control", "no-cache");
  xhr.setRequestHeader("Pragma", "no-cache");
  xhr.onreadystatechange = function() {
	if (xhr.readyState == 4) {
	  if (xhr.status == 200) {
	    if (xhr.responseText != null) {
	      // Work with the response
					callback(eval("(" + xhr.responseText + ")"));
	    }
	    else {
					callback({"error":1});
	    }
	  } else {
	    callback({"error":1});
	  }
	}
  };
  // send the request
  xhr.send(null);
}

function strWordCut(s, max)
{
  if (s.length <= max) {
    return s;
  }
  
  var output = '';
  var t = 3;
  while (t < max) {
    if (s.charAt(max - t) == ' ') {
      output = s.substr(0,max - t)+'...';
      break;
    }
    t++;
  }
  if (!output && max > 3) {
    output = s.substr(0,max-3)+'...';
  }

  return output;
}

function insertAfter(newChild, refChild) { 
  refChild.parentNode.insertBefore(newChild, refChild.nextSibling); 
} 

//////////////////////////////////////////

function setError(id, response)
{
	var errorMessage;
	if (response.errorMessage) {
		errorMessage = response.errorMessage; 
	} else {
		errorMessage = "Internal error, please try again later";
	}
  document.getElementById(id).innerHTML = '<div class="text">'+errorMessage+'</div>';
}

/* getFullYear() doesn't working
function getDateString(date)
{
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var hour = date.getHours();
  if (hour < 10) {
    hour = '0'+hour;
  }
  var min = date.getMinutes();
  if (min < 10) {
    min = '0'+min;
  }
  return date.getDate()+' '+months[date.getMonth()]+' '+date.getFullYear()+' '+hour+':'+min+' GMT';	
} */


function getRubrics()
{
	loadObject("http://learnews.com/api/?action=getRubrics", function (response) {
		if (!response.error && response.items.length) {
	    var html = "";
	    var onclick = 
			"mwl.insertHTML('#screen-news', 'Loading...&nbsp;&nbsp;'); "+
			"mwl.addClass('#screen-news', 'loading'); "+
	    "mwl.switchClass('#slider', 'pos-start', 'pos-news'); "+
	    "mwl.switchClass('#buttons-slider', 'buttons-pos-start', 'buttons-pos-news'); "+
	    "mwl.scrollTo('#top');";
	    
	    for (var i = 0; i < response.items.length; i++) {
	      html += '<div class="li" onclick="'+onclick+' getArticles('+response.items[i].id+');">';
	      html += '<div class="lit">'+response.items[i].title+'</div>';
	      html += '</div>';
	    }

      if (getLanguage().match(/^en/i)) {
        var html0 = "<div class=\"subtitle-info\" onclick=\"mwl.switchClass('#slider', 'pos-start', 'pos-help'); mwl.switchClass('#buttons-slider', 'buttons-pos-start', 'buttons-pos-help'); mwl.scrollTo('#screen-help');\">Please <span class=\"an\">choose a language</a></div>";
        document.getElementById("language-selector").innerHTML = html0;
      }
	    
      html = '&nbsp;<div class="list1 indent-hack">'+html+'</div>';
	    mwl.removeClass('#screen-start', 'loading');
	    document.getElementById("screen-start").innerHTML = html;
		} else {
			setError('screen-start', response);
		}
  });
}

function getArticles(id)
{
	var limit = 20;
	var cut = 58;
  loadObject("http://learnews.com/api/?action=getArticles&id="+id+"&limit="+limit, function (response) {
    if (!response.error && response.items.length) {
			var html = '';
      var onclick = 
      "mwl.insertHTML('#screen-reader', 'Loading...&nbsp;&nbsp;'); "+
      "mwl.addClass('#screen-reader', 'loading'); "+
      "mwl.switchClass('#slider', 'pos-news', 'pos-reader'); "+
      "mwl.switchClass('#buttons-slider', 'buttons-pos-news', 'buttons-pos-reader'); "+
      "mwl.scrollTo('#top');";

			for (var i = 0; i < response.items.length; i++) {
				html += '<div class="li" onclick="'+onclick+' getArticle('+response.items[i].id+');">';
				html += '<div class="lit">' + strWordCut(response.items[i].title, cut) + '</div>';
				html += '<div class="lid">' + response.items[i].timestring + '</div>';
				html += '</div>';
			}
			
			html = '<div class="subtitle">'+response.rubric.title+'</div><div class="list2">'+html+'</div>';
			mwl.removeClass('#screen-news', 'loading');
			document.getElementById("screen-news").innerHTML = html;
		} else {
      setError('screen-news', response);
		}
  });
}

function getArticle(id)
{
  loadObject("http://learnews.com/api/?action=getArticle&id="+id, function (response) {
    if (!response.error && response.article.id) {
			var regexp = /<a(.*?)id="(.*?)"(.*?)>(.*?)<\/a>/gi;
      response.article.htmlTitle = response.article.htmlTitle.replace(regexp, '<a id="$2" onclick="mwl.insertHTML(\'#t$2\', \' (loading...)\'); mwl.addClass(\'#t$2\', \'lw\'); tr(this);"$1$3>$4</a> <span id="t$2"></span>');
		  response.article.html = response.article.html.replace(regexp, '<a id="$2" onclick="mwl.insertHTML(\'#t$2\', \' (loading...)\'); mwl.addClass(\'#t$2\', \'lw\'); tr(this);"$1$3>$4</a> <span id="t$2"></span>');
			// <p></p> -> <br/><br/>
      response.article.html = response.article.html.replace(/<p[^>]*>/g, '');
      response.article.html = response.article.html.replace(/<\/p>/g, '<br/><br/>');

      var html = '';			
      if (typeof response.ads1 != 'undefined' && response.ads1) {
        html += '<div class="ads1">'+
                  '<div class="ads1-content">'+				
    				        response.ads1+
                  '</div>';
								'</div>';
      }
      html += '<div id="reader" class="text">'+
			          '<div class="reader-title">'+
	               // HACK: removing indent
	               '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+
					      response.article.htmlTitle+
								 '</div>'+
			           '<div class="reader-date">'+
	               // HACK: removing indent
	               '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+
								 response.article.timestring+
								 '</div>'+
	               '<div class="reader-body">'+
	               // HACK: removing indent
					 '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+
					 response.article.html+
					 '</div>'+
				   '</div>';
								 
		  if (typeof response.source != 'undefined' && response.source) {
				html += '<div id="source">'+response.source+'</div>';
			}
      if (typeof response.ads2 != 'undefined' && response.ads2) {
        html += '<div class="ads2">'+
                  '<div class="ads2-content">'+       
                    response.ads2+
                  '</div>';
                '</div>';
      }

      // HACK: removing indents
      // Removing any line-breaks
      html = html.replace(/[\n]+/g, '');			
      html = html.replace(/[\r]+/g, '');     
      html = html.replace(/<br>/g, '<br/>');     
      html = html.replace(/<br\/><br\/>/g, '<br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');     

      mwl.removeClass('#screen-reader', 'loading');
      document.getElementById("screen-reader").innerHTML = html;
      translation = response.translation;
    } else {
      setError('screen-reader', response);
    }
  });
}

function getTranslation(word, obj, callback)
{
  var lowerCase = word.toLowerCase();
  if (typeof translation[lowerCase] != 'undefined' && translation[lowerCase]) {
    callback(obj, translation[lowerCase]);
  } else {
    loadObject("http://learnews.com/api/?action=getTranslation&word="+encodeURIComponent(word), function (response) {
      if (!response.error && response.translation) {
        var text = response.translation;
      } else {
        var text = 'error';
      }
      callback(obj, text);
    });
  }
}

function getDict(word)
{
  loadObject("http://learnews.com/api/?action=getDict&word="+encodeURIComponent(word), function (response) {
    if (!response.error && response.html) {
      var onclick = 
      "mwl.insertHTML('#screen-dict', 'Loading...&nbsp;&nbsp;'); "+
      "mwl.addClass('#screen-dict', 'loading'); "+
      "mwl.scrollTo('#top'); "+
      "getDict('$1');";
      response.html = response.html.replace(/<a title="(.+?)"/gi, '<a onclick="'+onclick+'" class="link"');
			
      // IPA
      response.html = response.html.replace(/ˈ/g, "'");
      response.html = response.html.replace(/ː/g, ":");
      response.html = response.html.replace(/ˌ/g, ",");
			
      var html = '<div class="subtitle">Dictionary</div><div class="dict">'+response.html+'</div>';
      if (typeof response.source != 'undefined' && response.source) {
        html += '&nbsp;<div id="source">'+
				response.source+
				'</div>';
      }
      mwl.removeClass('#screen-dict', 'loading');
      document.getElementById("screen-dict").innerHTML = html;
    } else {
      setError('screen-dict', response);
    }
  });
}

function tr(obj) {
	var word = obj.title;
	//obj.onclick = function () {return false}
	getTranslation(word, obj, function(obj, translation){
		// Translation
    var onclick = 
    "mwl.insertHTML('#screen-dict', 'Loading...&nbsp;&nbsp;'); "+
    "mwl.addClass('#screen-dict', 'loading'); "+
    "mwl.switchClass('#slider', 'pos-reader', 'pos-dict'); "+
    "mwl.scrollTo('#top'); "+
    "mwl.switchClass('#buttons-slider', 'buttons-pos-reader', 'buttons-pos-dict'); "+
    "getDict('"+obj.title+"');";
    var html = ' <span class="tr" onclick="'+onclick+'">(' + translation + ')</span>';
		document.getElementById('t'+obj.id).innerHTML = html;
	});
}

///////////////////////////

// Setting selected
function initLanguageForm()
{
// BUG with Auto-detect indent
//  var html = '<option value="auto">Auto-detect</option>';
//  for (var key in getLanguages()) {
//    html += '<option value="' + key + '">' + languages[key] + '</option>';
//  }
//  document.getElementById("select-lang").innerHTML = html;
	
	var lang = widget.preferences.getItem('lang');
	var dd = document.getElementById('select-lang');
	for (var i=0; i < dd.options.length; i++) {
	  if (dd.options[i].value == lang) {
	    dd.options[i].selected = true;
	  }
	}
}

function onLanguageSelect()
{
	var lang = document.getElementById('select-lang').value;
  if (lang && (lang == 'auto' || typeof getLanguages()[lang] != 'undefined')) {
  	widget.preferences.setItem('lang', lang);
  	if (!getLanguage().match(/^en/)) {
  		document.getElementById("language-selector").innerHTML = '';
  	}
	}
}




