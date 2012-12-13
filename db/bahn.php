<?php
ini_set('display_errors', 'On');

require_once("bahn.class.php"); // Klasse einbinden 

function getWupperstrasse()
{
  $bahn=new bahn("Wupperstrasse, Duesseldorf","abfahrt"); 

  $bahn->TypeICE(false); 
  $bahn->TypeIC(false); 
  $bahn->TypeRE(false); 
  $bahn->TypeFAEHRE(false); 
  $bahn->TypeBUS(false); 
  /* 
  $bahn->TypeTRAM(false); 
  $bahn->TypeSBAHN(false); 
  $bahn->TypeUBAHN(false); 
  */ 

  $bahn->limitToTrain('708');
  $bahn->maxResults(2);
  $abfragestatus=$bahn->fetch();
  if($abfragestatus){ 
    return $bahn->timetable;
  }
}

function getVoelklingerStrasse()
{
  $bahn=new bahn("Düsseldorf Völklinger Str.#008001603","abfahrt"); 

  $bahn->TypeICE(false); 
  $bahn->TypeIC(false); 
  $bahn->TypeRE(false); 
  $bahn->TypeFAEHRE(false); 
  $bahn->TypeBUS(false); 
  $bahn->TypeTRAM(false);
  $bahn->TypeUBAHN(false); 
  /* 
  $bahn->TypeSBAHN(false); 
  */ 

//  $bahn->limitToTrain('S11');
  $bahn->maxResults(5);
  $abfragestatus=$bahn->fetch();
  if($abfragestatus){ 
    return $bahn->timetable;
  }
}

echo json_encode(array('wupper' => getWupperstrasse(), 'voelklinger' => getVoelklingerStrasse()));

