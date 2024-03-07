precision mediump float;
uniform float iTime;
uniform vec2 iResolution;
uniform vec4 iMouse;

const float CAMERA_OFFSET = -7.0;
const int MAX_ITERATIONS = 80;
const float MIN_DISTANCE = 0.001;
const float MAX_TOTAL_DISTANCE = 100.0;
const float FOV_SCALE = 1.0;

const vec3 GROUND_COLOR = vec3(1.0, 0.0, 0.0);
const vec3 BOX_COLOR = vec3(0.0, 1.0, 0.0);
const vec3 SPHERE_COLOR = vec3(0.0, 0.0, 1.0);
const vec3 LIGHT_COLOR = vec3(1.0, 1.0, 1.0);

vec4 distanceUnion(vec4 a, vec4 b) {
  return a.w < b.w ? a : b;
}

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

vec4 getDistance(vec3 position) {
  //vec3 spherePos = vec3(sin(iTime*3.0)*2.0,0,0);
    
  //float sphere_distance = sdSphere(position - spherePos, 0.5);
  vec3 sphere_pos = vec3(-2.0, 0.0, 0.0);
  float sphere_radius = 1.0;
  float sphere_distance = sdSphere(position - sphere_pos, sphere_radius);
  vec4 sphere = vec4(SPHERE_COLOR, sphere_distance);
  
  // vec3 q = position;
  // q.y -= iTime * 0.4;
  // q = mod(q, 0.8) - 0.4;

  // q.xy *= rot2D(iTime);
  
  // float box_distance = sdBox(q, vec3(0.1));
  vec3 box_size = vec3(1.0);
  vec3 box_pos = vec3(2.0, 0.0, 0.0);
  float box_distance = sdBox(position - box_pos, box_size);
  vec4 box = vec4(BOX_COLOR, box_distance);

  float ground_distance = position.y + 1.0;
  vec4 ground = vec4(GROUND_COLOR, ground_distance);

  vec4 scene = distanceUnion(box, ground);
  scene = distanceUnion(scene, sphere);

  return scene;
  //return min(sphere_distance, min(box_distance, ground_distance));
  //return box_distance;
  //return sphere_distance;
}

vec4 rayMarch(vec3 ray_origin, vec3 ray_direction) {
  float total_distance = 0.0;
  vec4 color_distance;

  for (int iterations = 0; iterations < MAX_ITERATIONS; iterations++) {
  
    // Current position along ray
    vec3 ray_position = ray_origin + (ray_direction * total_distance);
    
    // Distance from ray to object
    color_distance = getDistance(ray_position);
    float distance = getDistance(ray_position).w;

    // march the ray by distance
    total_distance += distance;
    
    if (distance < MIN_DISTANCE) break;
    if (total_distance > MAX_TOTAL_DISTANCE) break;
  }

 return vec4(color_distance.xyz, total_distance);
}

vec3 getNormal(vec3 surface_point) {
  float distance = getDistance(surface_point).w;
  const vec2 epsilon = vec2(0.01, 0.0);
  vec3 normal = distance - vec3(
    getDistance(surface_point - epsilon.xyy).w, 
    getDistance(surface_point - epsilon.yxy).w, 
    getDistance(surface_point - epsilon.yyx).w);
  return normalize(normal);
}

vec3 getLight(vec3 surface_point, vec3 light_position) {
  vec3 l = normalize(light_position - surface_point);
  vec3 normal = getNormal(surface_point);
  float diffuse = dot(normal, l);

  // Check for shadow.
  // float d = rayMarch(surface_point + normal * 0.01, l);
  // if (d < length(light_position-surface_point)) {
  //   diffuse *= 0.1;
  // }
  
  // Check for shadow
  vec4 d = rayMarch(light_position, -l);
  if (d.w < length(light_position-surface_point) - 0.01) {
    diffuse *= 0.1;
  }
  return vec3(diffuse * d.xyz);
}

void main() {
  vec2 fragCoord = vec2(gl_FragCoord.x, gl_FragCoord.y);
  vec2 uv = (fragCoord- 0.5 * iResolution.xy) / iResolution.y;
  vec2 mouse = (iMouse.xy - 0.5 * iResolution.xy) / iResolution.y;
  
  vec3 ray_origin = vec3(0,0,CAMERA_OFFSET);
  vec3 ray_direction = normalize(vec3(uv * FOV_SCALE,1));
  
  // Vertical camera rotation
  // ray_origin.yz *= rot2D(mouse.y);
  // ray_direction.yz *= rot2D(mouse.y);
  
  // Horizontal camera rotation (mouse)
  // ray_origin.xz *= rot2D(-mouse.x);
  // ray_direction.xz *= rot2D(-mouse.x);

  // Horizontal camera rotation (time)
  ray_origin.xz *= rot2D(-iTime);
  ray_direction.xz *= rot2D(-iTime);

  // Distance travelled
  float distance = rayMarch(ray_origin, ray_direction).w;

  const vec3 light_position = vec3(-2.0, 3.0, -3.0);
  vec3 pixel_color = getLight(ray_origin + ray_direction * distance, light_position);


  // const float near = 0.0;
  // const float far = 55.0;
  // float interp = 1.0 - clamp(0.0, 1.0, (distance - near) / (far - near));
  //vec3 pixel_color = vec3(interp);
  //vec3 pixel_color = vec3(diffuse_light);
  //vec3 pixel_color = vec3(getNormal(ray_origin + ray_direction * distance));
  gl_FragColor = vec4(pixel_color, 1);
}