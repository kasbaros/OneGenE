<?php
/**
 * Created by PhpStorm.
 * User: Kas Barlow
 * Date: 11/04/2017
 * Time: 15:51
 */

/*$profpic = "dna-6.2.jpg";*/
?>

<html>
    <head>
        <title>OneGenE | Search Results:</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:100,100i,300,300i,500,500i">

        <link rel="stylesheet" href="assets/font-awesome/css/font-awesome.min.css">
        <link rel="stylesheet" href="assets/css/animate.css">
        <link rel="stylesheet" href="assets/css/style.css">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:100,100i,300,300i,500,500i">
        <link rel="stylesheet" href="assets/bootstrap/css/bootstrap.min.css">    
        <link rel="stylesheet" type="text/css" href="assets/css/php_results_page_style.css">
        <link rel="shortcut icon" type="image/png" href="./networks/icon.png">

        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"></script>
        <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
        <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
        <script src="assets/js/exp_textare.js"></script>

        <!-- for the removal of space character in the textarea -->

        <script>
            $('textarea').keypress(function( e ) {
                    if(e.which === 32)
                        return false;
            });
        </script>
        
        <!-- end  -->
    </head>

    <body>

        <a href="./networks2/index.html" class="float" title="Click to Visualize!">
            <i class="fa fa-eye fa-2x my-float"></i>
        </a>    

        <div id="box1" class="box blurred-bg tinted">
            <div class="content">

                <div class="container" style="">
                    <div class="row">

                        <h1 style="margin-right: 60%;"><a href="./index.html" style="color: #080808; text-decoration:none">OneGenE</a> | Search Results:</h1>


                            <!-- Search box -->

                                <form action="index.php" method="POST" style="width: 20%; position: relative; left: 796px;">
                                        <textarea id="txt1" class="textarea" class="autoEpand" name="textarea" rows=n placeholder="Enter Gene Name or Alias..."
                                                  onkeyup="this.value = this.value.replace(/[&*<>@#!£$%/()=?^*-+ç°§ùàòèé,.;:_|-]/gi, '')"
                                                  style="width: 80%" required></textarea>
                                    <button id="btn" value="Click here" onclick="getText()" class="btn btn-primary" style=" height: 100%;
                                         position: absolute; top: 1%; border-radius: 0%; resize: none;">
                                        <i class="glyphicon glyphicon-search"></i></button>
                                </form>

                            <!-- End of search box -->

                        <div class="panel panel-default panel-table" style="border-radius: 0px; background: transparent; width: 89.5%; position: relative; top: 20%;">

                            <!--<div class="panel-heading" style="border-radius: 0px; background: transparent"></div>-->


                            <?php

                            if(isset($_POST['textarea'])!== ''){

                                echo "<h2 align='center'><a style='color:black; text-decoration:none;'<strong>Showing results of: ".$_POST["textarea"]."</strong></a></h2>";

                                $search = preg_split('/[\s]+/', $_POST['textarea']);
                                $php_errormsg = "Sorry, File could not load";

                                //Create connection to text file containing the genes information
                                $f = fopen("ec_oge_db.csv", "r") or die($php_errormsg);

                                $row = 1;
                                if (($handle = $f) !== FALSE) {
                                    ini_set( 'auto_detect_line_endings', true );
                    
                                    $result = [];
                                    echo "<table>
                                      <tr>
                                        <th>Select box to dispaly Network</th>
                                        <th>Gene Name</th>                            
                                      </tr>";

                                    while (($data = fgetcsv($handle, ",")) !== FALSE) {
                                        
                                        foreach($search as $key){
                                            if (strpos(strtolower($data[1]), $key) !== false) {
                                                
                                                $result[$key][] = $data;
                                            }
                                        }
                                    }
                                    
                                    foreach ( $result as $id => $output ) {
                                            foreach ($output as $key) {
                                      //echo "<tbody>";  
                                    echo "<tr>";          
                                                echo "<td><input type=\"checkbox\" name=\"gene\" value=\"gene\" title=\"Select box and then use visualise button to dipslay Gene network.\"></td>";
                                                echo "<td>".$key[1]."</td>";
                                                echo "<td style=\"display: none;\">".$key[0]."</td>";
                                    echo "</tr>";          
                                        }
                                    }                           
                                }
                            }?>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
</html>