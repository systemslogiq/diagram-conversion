#!/bin/bash

# Set the field separator to a newline character
IFS=$'\n'

source .env

# Initialize the path and suffix variables
input_path=$INPUT_PATH
output_path=$OUTPUT_PATH
suffix=""
startswith=$PREFIX

# Process the arguments
# -i input path
# -o output_path path
# -suffix suffix to append to the output file name
while [ "$1" != "" ]; do
  case $1 in
    -i | --input )   shift
                     input_path=$1
                     ;;
    -o | --output )  shift
                     output_path=$1
                     ;;
    -suffix )        shift
                     suffix=$1
                     ;;
    --startswith )   shift
                     startswith=$1
                     ;;
  esac
  shift
done

# Create the output directory if it doesn't exist
mkdir -p $output_path

# Set the default suffix if the suffix argument is not provided
# if [ "$suffix" == "" ]; then
#   suffix="_converted"
# fi

# Set the default output path if the output argument is not provided
if [ "$output_path" == "" ]; then
  output_path=$input_path
fi

# Set of image file extensions to process
image_extensions="png|gif|jpeg|jpg|bmp|tiff|tif"

# Loop through the list of files in the specified directory
for file in $(find $input_path -maxdepth 1 -name "${startswith}*"); do
  file_name=${file##*/}  # Get the file name from the full path
  extension=${file##*.}
  if [[ "$extension" =~ $image_extensions ]]; then
    
    if [[ ${#file_name} -eq 11 ]]; then
      # for plant/line diagrams, convert only, do not make background transparent
      echo "converting ${file_name%.*} -> ${file_name%.*}$suffix.webp"
      convert "$file" -quality 80% "$output_path/${file_name%.*}$suffix.webp"
    else 
      echo "making transparent and converting ${file_name%.*} -> ${file_name%.*}$suffix.webp"
      convert "$file" -fuzz 20% -alpha off -fill 'rgba(255,255,255,0)' -opaque white -quality 80% "$output_path/${file_name%.*}$suffix.webp"
    fi
  fi
done

