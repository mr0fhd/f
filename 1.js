
	const observer = new MutationObserver(function(mutationsList) {
	mutationsList.forEach(mutation => {
	if($('#user_profile:contains("˻FHD˺")').length){
	$("#app").addClass("FHD")
	}else{
	$("#app").removeClass("FHD")
	}
	});
	});
	
	const target = document.body;
	
	observer.observe(target, {
	childList: true,
	attributes: false,
	characterData: false,
	subtree: true
	});
	
