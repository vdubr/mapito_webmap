<?php
/**
 * UNIP proxy
 *
 * @example unipProxy.php?uri=http://www.geosense.cz/api/www/unip/findB.../24
 */


if (!isset($_GET['uri'])) die('Undefined target URI');

$ch = curl_init($_GET['uri']);

if (!empty($_POST))
{
  curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_POSTFIELDS, $_POST);
}

curl_exec($ch);
curl_close($ch);

