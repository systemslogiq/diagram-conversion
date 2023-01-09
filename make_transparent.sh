#!/bin/bash

# Set the field separator to a newline character
IFS=$'\n'

# Initialize the path and suffix variables
path=""
suffix=""
output=""
startswith="*"

# Process the arguments
# -i input path
# -o output path
# -suffix suffix to append to the output file name
while [ "$1" != "" ]; do
  case $1 in
    -i | --input )   shift
                     path=$1
                     ;;
    -o | --output )  shift
                     output=$1
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
mkdir -p $output

# Set the default suffix if the suffix argument is not provided
if [ "$suffix" == "" ]; then
  suffix="_converted"
fi

# Set the default output path if the output argument is not provided
if [ "$output" == "" ]; then
  output=$path
fi

# Set of image file extensions to process
image_extensions="png|gif|jpeg|jpg|bmp|tiff|tif"

# Loop through the list of files in the specified directory
for file in $(find $path -maxdepth 1 -name "${startswith}*"); do
  file_name=${file##*/}  # Get the file name from the full path
  extension=${file##*.}
  if [[ "$extension" =~ $image_extensions ]]; then
    echo $file
    convert "$file" -fuzz 20% -alpha off -fill 'rgba(255,255,255,0)' -opaque white "$output/${file_name%.*}$suffix.${file_name##*.}"
  fi
done

# for file in $(ls $path); do
#   # Check if the file is an image file
#   if file -b --mime-type "$path/$file" | grep -Eq "image/$image_extensions" && [[ $file == $startswith* ]]; then
#     # Execute the convert command on the file
#     convert "$path/$file" -fuzz 20% -alpha off -fill 'rgba(255,255,255,0)' -opaque white "$output/${file%.*}$suffix.${file##*.}"
#     echo "creating $output/${file%.*}$suffix.${file##*.}..."
#     # echo "$path/$file" | xargs -P $(sysctl -n hw.physicalcpu) -I {} convert "{}"  -fuzz 20% -alpha off -fill 'rgba(255,255,255,0)' -opaque white  "$output/${file%.*}$suffix.${file##*.}"
#   fi
# done

# Loop through the list of files in the specified directory
# for file in $(ls $path); do
#   # Check if the file is a gif
#   if [[ $file == *.gif ]]; then
#     # Execute the convert command on the file
#     convert "$path/$file" -fuzz 20% -alpha off -fill 'rgba(255,255,255,0)' -opaque white "$output/${file%.*}$suffix.${file##*.}"
#     # convert "$path/$file" -fuzz 20% -alpha off -fill 'rgba(255,255,255,0)' -opaque white "$input/converted/${file%.*}$suffix.${file##*.}"
#   fi
# done
