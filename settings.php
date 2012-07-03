<?
// global vars
$DRAFT = isset($_GET["draft"]) ? true : false;
$EDIT = isset($_GET["edit"]) ? true : false;
$LAYOUT = isset($_GET["layout"]) ? true : false;
$VIEW = isset($_GET["view"]) ? true : false;

$ID = 0;

// helpers
function render_placeholder($type = '') {
	$GLOBALS['ID'] = $GLOBALS['ID'] + 1;

	if($type === 'start') {
		return ($GLOBALS['EDIT'] || $GLOBALS['LAYOUT']) ? '<div id="cms_placeholder-'.$GLOBALS['ID'].'" class="cms_placeholder">' : '';
	} else {
		return ($GLOBALS['EDIT'] || $GLOBALS['LAYOUT']) ? '</div>' : '';
	}
}

function render_placeholder_bar($title = '') {
	$GLOBALS['ID'] = $GLOBALS['ID'] + 1;

	$tmp = 	'<div id="cms_placeholder-bar-'.$GLOBALS['ID'].'" class="cms_reset cms_placeholder-bar">' .
			'<div class="cms_placeholder-title">'.$title.'</div>' .
			'<div class="cms_placeholder-btn">' .
				'<a href="#"><span>Plugins</span></a>' .
				'<ul>' .
					'<li class="title"><span>Core plugins</span></li>' .
					'<li><a href="#">Text</a></li>' .
					'<li><a href="#">Link</a></li>' .
					'<li><a href="#">Picture</a></li>' .
					'<li><a href="#">File</a></li>' .
					'<li><a href="#">Flash/Video</a></li>' .
					'<li class="title"><span>Advanced plugins</span></li>' .
					'<li><a href="#">Google Map</a></li>' .
					'<li><a href="#">Teaser</a></li>' .
					'<li><a href="#">Twitter</a></li>' .
					'<li><a href="#">Snippet</a></li>' .
					'<li><a href="#">Inherit</a></li>' .
				'</ul>' .
			'</div>' .
			'</div>';

	return ($GLOBALS['LAYOUT']) ? $tmp : '';
}
?>