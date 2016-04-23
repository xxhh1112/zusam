<?php

chdir(realpath(dirname(__FILE__))."/../");
require_once('Include.php');

function account_getDummy($default) {
	$ac = [];
	$ac['_id'] = -1;
	$ac['date'] = -1;
	$ac['mail'] = $default['mail'];
	$ac['name'] = $default['name'];
	$ac['password'] = "";
	$ac['forums'] = [];
	$ac['salt'] = "888888888888";
	return $ac;
}

function account_usageTimestamp(&$ac) {
	$ac['usage'] = time();
}

function account_updateTimestamp(&$ac) {
	$ac['timestamp'] = time();
}

function account_addUnread(&$ac, $pid) {
	$pid = (String) $pid;
	if(!isset($ac['unread'])) {
		$ac['unread'] = [];
	}
	array_push($ac['unread'], $pid);		
	
	//TODO XXX TRICK
	//$unread = $ac['unread'];
	//unset($ac['unread']);
	//$ac['unread'] = $unread;
}

function account_readPost(&$ac, $pid) {
	$pid = (String) $pid;
	foreach($ac['unread'] as $k=>$v) {
		if($v == $pid) {
			unset($ac['unread'][$k]);
			continue;
		}
		$p = post_load(array('_id'=>$pid));
		if($p == false || $p == null) {
			unset($ac['unread'][$k]);
			continue;
		}
		// TODO : this was temporary to fix the database. Can be erased in 1 month (the 22 April 2016)
		if((String) $p['uid'] == (String) $ac['_id'] && count($p['children']) == 0) {
			unset($ac['unread'][$k]);
			continue;
		}
	}

	//$ac['unread'] = deleteAllValues($pid, $ac['unread']);
	$ac['unread'] = array_values($ac['unread']);
	//var_dump($ac['unread']);

	//TODO XXX TRICK
	//$unread = $ac['unread'];
	//unset($ac['unread']);
	//$ac['unread'] = $unread;
}

function account_setPassword(&$ac, $password) {
	$ac['password'] = password_hash($password, PASSWORD_BCRYPT);
}

function account_initialize($mail, $password) {
	$ac = [];
	$ac['_id'] = mongo_id();
	$ac['date'] = mongo_date();
	$ac['mail'] = $mail;
	$ac['name'] = preg_replace("/^(.*)@.*$/","$1",$mail);
	account_setPassword($ac, $password);
	$ac['forums'] = [];
	$ac['salt'] = bin2hex(openssl_random_pseudo_bytes(6));
	return $ac;
}

// counting uploads
//function account_addUpload(&$ac) {
//	if(!isset($ac['upload'])) {
//		$ac['upload'] = array("number"=>0,"last_cycle"=>time());
//	}
//	if($ac['upload']['last_cycle'] < time() - 30*24*60*60) {
//		$ac['upload']['last_cycle'] = time();
//		$ac['upload']['number'] = 0;
//	}
//	$ac['upload'] = $ac['upload'] + 1;
//}

function account_save(&$ac) {
	mongo_save("accounts",$ac);
}

function account_bulkLoad($array) {
	$ac = mongo_bulkLoad("accounts",$array);
	return $ac;
}

function account_load($array) {
	$ac = mongo_load("accounts", $array);
	return $ac;
}

function account_getAvatar(&$ac) {
	//dummy
	if($ac['_id'] == "-1") {
		return p2l(pathTo2(array("url"=>"avatar","param"=>"assets","ext"=>"png")));
	}
	$loc = array("url"=>(String) $ac['_id'], "param"=>"avatar", "ext"=>"jpg");
	if(file_exists(pathTo2($loc))) {
		$avatar = p2l(pathTo2($loc));
	} else {
		return p2l(pathTo2(array("url"=>"avatar","param"=>"assets","ext"=>"png")));
	}
	return $avatar;
}

function account_getAvatarHTML(&$ac) {
	$html = "";
	$avatar = account_getAvatar($ac);
	if($avatar == "") {
		$html = '<img src="'.p2l(pathTo2(array("url"=>"avatar","param"=>"assets","ext"=>"png"))).'"/>';
	} else {
		$html = '<img src="'.$avatar.'"/>';
	}
	return $html;
}

function account_destroy($id) {

	$mid = mongo_id($id);
	$ac = account_load(array('_id'=>$id));
	if($ac != null && $ac != false) {
		
		// unsubscribe from forums
		foreach($ac['forums'] as $fid=>$value) {
			$f = forum_load(array('_id'=>$fid));
			if($f != null && $f != false) {
				forum_removeUser_andSave($f, $ac);	
			}
		}

		// destroy notifications
		$notifications = notification_bulkLoad(array('target'=>$mid));
		foreach($notifications as $n) {
			notification_destroy($n['_id']);
		}

		// destroy posts
		$posts = post_bulkLoad(array('uid'=>$mid));
		foreach($posts as $p) {
			post_destroy($p['_id']);
		}

		// destroy files
		$files = file_bulkLoad(array('owner'=>$mid));
		foreach($files as $f) {
			file_destroy($f['_id']);
		}

		mongo_destroy("accounts",$id);
	}
}

// add forum
function account_addForum(&$ac, &$f) {
	$fid = (String) $f['_id'];
	if($ac['forums'][$fid] == null) {
		$ac['forums'][$fid]['timestamp'] = time();
	}
}

?>