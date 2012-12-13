<? 
/* 
Author: Frederik Granna (sysrun) 
Version 0.1 
*/ 


class bahn{ 
    var $_BASEURL="http://reiseauskunft.bahn.de/bin/bhftafel.exe/dn?"; 
    var $_PARAMS=array(); 
    var $timetable=array(); 
    var $bahnhof=false; 
    var $_FETCHMETHOD; 
    function bahn($bahnhof=null,$type="abfahrt"){ 
       $type=strtolower($type); 
     
     
       if(!$bahnhof) 
          $bahnhof="Hannover HBF"; 
        $this->_init($bahnhof); 
        $this->fetchMethodCURL(true); 
        $this->boardType($type); 
         
        //$this->_query(); 
    } 

    function TypeBUS($state=true){$this->_PARAMS['GUIREQProduct_5'] = ($state) ? "on" : false;} 
    function TypeICE($state=true){$this->_PARAMS['GUIREQProduct_0'] = ($state) ? "on" : false;} 
    function TypeIC($state=true){$this->_PARAMS['GUIREQProduct_1'] = ($state) ? "on" : false;} 
    function TypeRE ($state=true){$this->_PARAMS['GUIREQProduct_3'] = ($state) ? "on" : false;} // NV genannt 
    function TypeSBAHN ($state=true){$this->_PARAMS['GUIREQProduct_4'] = ($state) ? "on" : false;}  
    function TypeFAEHRE ($state=true){$this->_PARAMS['GUIREQProduct_6'] = ($state) ? "on" : false;}   // UBAHN 
    function TypeTRAM ($state=true){$this->_PARAMS['GUIREQProduct_8'] = ($state) ? "on" : false;}   // STrassenbahn 
    function TypeUBAHN ($state=true){$this->_PARAMS['GUIREQProduct_7'] = ($state) ? "on" : false;}   // UBAHN 

    function maxResults ($max) { $this->_PARAMS['maxJourneys'] = $max; }
    function limitToTrain ($name) { $this->_PARAMS['Train_name'] = $name; }

    function boardType($type){ 
        if($type=="ankunft") 
            $this->_PARAMS['boardType']="arr"; 
        else 
            $this->_PARAMS['boardType']="dep"; 

    } 

    function datum($datum){ 
        $this->_PARAMS['date']=$datum; 
    } 
     
    function zeit($zeit){ 
        $this->_PARAMS['time']=$zeit; 

    } 

    /** 
     * 
     **/ 
    function fetch($html=null){ 
       if($html){ 
          return $this->_parse($html); 
       }else if($this->_FETCHMETHOD=="CURL"){ 
            return $this->_queryCurl(); 
        } 
    } 


    function _queryCurl(){ 
        $this->buildQueryURL(); 
        $result=$this->_call(); 
        return $this->_parse($result); 
    } 

    function buildQueryURL(){ 
       $fields_string=""; 
        foreach($this->_PARAMS as $key=>$value){ 
           if($value) 
                $fields_string .= $key.'='.urlencode($value).'&'; 
        }; 
        rtrim($fields_string,'&'); 

        $this->_URL=$this->_BASEURL.$fields_string; 
        return $this->_URL; 
    } 

    function _parse($data){ 
        $dom = new DOMDocument(); 
        @$dom->loadHTML($data); 
        $select=$dom->getElementById("rplc0"); 
        if($select->tagName=="select"){ 
            echo "Multiple Match:\n";
            $options=$select->getElementsByTagName("option"); 
            foreach($options AS $op){ 
                echo utf8_decode($op->getAttribute("value")." -> ".$op->nodeValue)."\n"; 
            } 
            return false; 
        }else{ 
           $this->bahnhof= $this->formatValue($select->getAttribute("value")); 
            $this->_process_dom($dom); 
            return true; 
        } 
    } 

    function _process_dom($dom){ 
            $test=$dom->getElementById("sqResult")->getElementsByTagName("tr"); 
            $data=array(); 
            foreach($test as $k=>$t){ 
                $tds=$t->getElementsByTagName("td"); 
                foreach($tds AS $td){ 
                   $dtype=$td->getAttribute("class"); 
                    switch($dtype){ 
                        case 'train': 
                            if($a=$td->getElementsByTagName("a")->item(0)){ 
                                $data[$k]['train']=str_replace(" ","",$a->nodeValue); 
                                if($img=$a->getElementsByTagName("img")->item(0)){ 
                                    if (preg_match('%/([a-z]*)_%', $img->getAttribute("src"), $regs)) { 
                                       switch($regs[1]){ 
                                          case 'EC': 
                                             $data[$k]['type']="IC"; 
                                          break; 
                                            default: 
                                                $data[$k]['type']=strtoupper($regs[1]); 
                                            break; 
                                        } 
                                    } 
                                } 
                            } 
                             
                        break; 
                        case 'route': 
                           if($span=@$td->getElementsByTagName("span")->item(0)){ 
                              $data[$k]['route_ziel']=trim($span->nodeValue);
                            } 
                            preg_match_all('/(.*)\s*([0-9:]{5})/', $td->nodeValue, $result, PREG_PATTERN_ORDER);
                            $tmp=array(); 
                            foreach($result[1] AS $rk=>$rv){ 
                                $tmp[$result[2][$rk]]= $this->formatValue($rv); 
                                #$tmp[$result[2][$rk]]=utf8_decode(trim(html_entity_decode(str_replace("\n","",$rv)))); 
                            } 
                            $data[$k]['route']=$tmp; 
                            //print_r($tmp); 
                            /* 

                            $data[$k]['route']=explode("-",$td->nodeValue); 
                            foreach($data[$k]['route'] AS $dk=>$dv) 
                               $data[$k]['route'][$dk]=utf8_decode(trim(html_entity_decode(str_replace("n","",$dv)))); 
                            */ 
                        break; 
                        case 'time': 
                        case 'platform': 
                        case 'ris': 
                           $data[$k][$dtype]=$td->nodeValue; 
                        break; 


                    } 
                    //echo "n"; 
                } 
            } 
            foreach($data AS $d){ 
                if(array_key_exists("train",$d)){ 
                   foreach($d AS $dk=>$dv) 
                      if(!is_array($dv)) 
                          $d[$dk]=$this->formatValue($dv);
                          #$d[$dk]=ltrim(str_replace("\n","",utf8_decode(trim(html_entity_decode($dv)))),"-"); 
                    $d['route_start']=$this->bahnhof; 
                    $this->timetable[]=$d; 
             } 
            } 
    } 

    function formatValue($value) {
      return ltrim(str_replace("\n","",(trim(html_entity_decode($value)))),"-");
    }

    function fetchMethodCURL($state){ 
        if($state){ 
            $this->_FETCHMETHOD="CURL"; 
        }else{ 
            $this->_FETCHMETHOD="OTHER"; 
        } 
    } 


    function _call(){ 
        $this->_CH = curl_init(); 
        curl_setopt($this->_CH,CURLOPT_RETURNTRANSFER,true); 
        curl_setopt($this->_CH,CURLOPT_URL,$this->_URL); 
        $result = curl_exec($this->_CH); 
        curl_close($this->_CH); 
        return $result; 
    } 

    function _init($bahnhof){ 
        $this->_PARAMS=array( 
            'country'=>'DEU', 
            'rt'=>1, 
            'GUIREQProduct_0'=>'on',    // ICE 
            'GUIREQProduct_1'=>'on',   // Intercity- und Eurocityzüge 
            'GUIREQProduct_2'=>'on',   // Interregio- und Schnellzüge 
            'GUIREQProduct_3'=>'on',   // Nahverkehr, sonstige Züge 
            'GUIREQProduct_4'=>'on',    // S-Bahn 
            'GUIREQProduct_5'=>'on',    // BUS 
            'GUIREQProduct_6'=>'on',    // Schiffe 
            'GUIREQProduct_7'=>'on', // U-Bahn 
            'GUIREQProduct_8'=>'on', // Strassenbahn 
            'REQ0JourneyStopsSID'=>'', 
            'REQTrain_name'=>'', 
            'REQTrain_name_filterSelf'=>'1', 
            'advancedProductMode'=>'', 
            'boardType'=>'dep', // dep oder arr 
            'date'=>date("d.m.Y"), 
            'input'=>$bahnhof, 
            'start'=>'Suchen', 
            'time'=>date("H:i") 
        ); 


    } 

} 

?>
