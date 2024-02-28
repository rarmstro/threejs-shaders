precision mediump float;
uniform float iTime;
uniform vec2 iResolution;
uniform vec4 iMouse;

const float CAMERA_OFFSET = -3.0;
const int MAX_ITERATIONS = 80;
const float MIN_DISTANCE = 0.001;
const float MAX_TOTAL_DISTANCE = 100.0;
const float FOV_SCALE = 1.0;

mat2 rot2D(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
}

float sdBox(vec3 position, vec3 size) {
    vec3 q = abs(position) - size;
    return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)), 0.0);
}

float sdSphere(vec3 position, float radius) {
    return length(position) - radius;
}

float map(vec3 position) {

    
    vec3 spherePos = vec3(sin(iTime*3.0)*2.0,0,0);
    
    float sphere_distance = sdSphere(position - spherePos, 0.5);
    
    vec3 q = position;
    q.y -= iTime * 0.4;
    q = mod(q, 0.8) - 0.4;

    
    q.xy *= rot2D(iTime);
    
    float box_distance = sdBox(q, vec3(0.1));
    
    return min(sphere_distance, box_distance);
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
    vec2 mouse = (iMouse.xy * 2.0 - iResolution.xy) / iResolution.y;
    
    vec3 ray_origin = vec3(0,0,CAMERA_OFFSET);
    vec3 ray_direction = normalize(vec3(uv * FOV_SCALE,1));
    
    // Vertical camera rotation
    ray_origin.yz *= rot2D(-mouse.y);
    ray_direction.yz *= rot2D(-mouse.y);
    
    // Horizontal camera rotation
    ray_origin.xz *= rot2D(-mouse.x);
    ray_direction.xz *= rot2D(-mouse.x);
     
    // Distance travelled
    float total_distance = 0.0;
    
    int iterations;
    for (iterations = 0; iterations < MAX_ITERATIONS; iterations++) {
    
        // Current position along ray
        vec3 ray_position = ray_origin + (ray_direction * total_distance);
        
        // Distance from ray to object
        float distance = map(ray_position);
    
        // march the ray by distance
        total_distance += distance;
        
        if (distance < MIN_DISTANCE) break;
        if (total_distance > MAX_TOTAL_DISTANCE) break;
    }
    
    vec3 pixel_color = vec3(total_distance * 0.1 + float(iterations) * 0.01);
    fragColor = vec4(0.2, pixel_color.yz, 1);
    
}

void main()	{
  vec2 fragCoord = vec2(gl_FragCoord.x, gl_FragCoord.y);

  vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;

  vec2 m = (iMouse.xy + 1.0) / 2.0;

  float x = mod(iTime * 10.0 + uv.x * 100.0, 50.) < 25. ? m.x : 0.;
  float y = mod(iTime * 10.0 + uv.y * 100.0, 50.) < 25. ? m.y : 0.;

  gl_FragColor = vec4(vec3(m.xy, min(x, y)), 1.0-iMouse.z);
}

