#!/bin/bash

json_file="Simple_example.json"

# Prüfen, ob jq installiert ist
if ! command -v jq &> /dev/null; then
    echo "jq ist nicht installiert. Bitte installieren Sie jq, um fortzufahren."
    echo "Installation Mac: brew install jq"
    echo "Installation Ubuntu: sudo apt-get install jq"
    echo "Installation Windows: https://stedolan.github.io/jq/download/ download binary and add to PATH"
    exit 1
fi
# JSON-Datei parsen und Namen und Typen anzeigen
cat $json_file | jq '.[] | {name, type}'

#Test if JSON file is present and actually a file
if test -f $json_file; then
  echo "Parsing JSON ......."
  cat $json_file | jq 'keys[]'
  json_data=$(cat "$json_file" | jq -r '.[] | {name: .name, type: .type}')
  echo $json_data
  things=()

else
  echo "File: $json_file not found"
fi





