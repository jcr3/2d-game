#version 330 core

uniform sampler2D tex;
uniform sampler2D noise;

in vec2 uvs;
out vec4 fragOutColor;

void main(){

    float threshold = texture(noise, uvs).r;

    if ( threshold < 0.1 ){
        fragOutColor = vec4(texture(tex, uvs).rgb, 1.0);
    }
    else if ( threshold < 0.5){
        fragOutColor = vec4(0, 255, 0, 1.0);
    }
    else{
        fragOutColor = vec4(255, 0, 0, 1.0);
    }
}