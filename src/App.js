import React, { useState, createContext, useContext, useEffect, useRef, useCallback, memo } from 'react';
import * as THREE from 'three';
import {
  Search, Star, Film, Heart, Skull, Tv, ArrowRight, X, Info,
  Clapperboard, Ghost, HeartCrack, Globe2, Loader2, Menu,
  LayoutDashboard, Settings, LogOut, TrendingUp, Flame,
  Calendar, FileText, User, Clock, Zap, Link as LinkIcon,
  ChevronRight, ThumbsUp, ThumbsDown, MinusCircle, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * UTILITIES
 */
function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * UI COMPONENTS
 */

// --- BADGE ---
const Badge = ({ className, variant = "default", ...props }) => {
  const variants = {
    default: "border-transparent bg-indigo-600 text-white hover:bg-indigo-700",
    secondary: "border-transparent bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
    outline: "text-neutral-200 border-neutral-700",
  };
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], className)} {...props} />
  );
};

// --- BUTTON ---
const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20",
    destructive: "bg-red-500 text-white hover:bg-red-600",
    outline: "border border-neutral-700 bg-transparent hover:bg-neutral-800 text-neutral-200",
    secondary: "bg-neutral-800 text-neutral-200 hover:bg-neutral-700",
    ghost: "hover:bg-neutral-800 text-neutral-200",
    link: "text-indigo-400 underline-offset-4 hover:underline",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  };
  return (
    <button
      ref={ref}
      className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", variants[variant], sizes[size], className)}
      {...props}
    />
  );
});
Button.displayName = "Button";

// --- GET STARTED BUTTON (REFRESH CONTENT) ---
function GetStartedButton({ onClick, loading }) {
  return (
    <Button
      className="group relative overflow-hidden bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-500/20 shadow-lg shadow-indigo-900/20"
      size="lg"
      onClick={onClick}
      disabled={loading}
    >
      <span className="mr-8 transition-opacity duration-500 group-hover:opacity-0 font-bold tracking-wide">
        {loading ? 'Loading...' : 'Refresh Content'}
      </span>
      <i className="absolute right-1 top-1 bottom-1 rounded-sm z-10 grid w-1/4 place-items-center transition-all duration-500 bg-black/20 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95 text-white">
        {loading ? <Loader2 className="animate-spin" size={16} /> : <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />}
      </i>
    </Button>
  );
}

// --- CARD ---
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-200 shadow-sm", className)} {...props} />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

/**
 * CELESTIAL SPHERE SHADER
 */
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform float u_cloud_density;
  uniform float u_glow_intensity;

  float random(vec3 p) {
    return fract(sin(dot(p, vec3(12.9898,78.233,151.7182))) * 43758.5453);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f*f*(3.0 - 2.0*f);

    return mix(
      mix(mix(random(i+vec3(0,0,0)), random(i+vec3(1,0,0)), u.x),
          mix(random(i+vec3(0,1,0)), random(i+vec3(1,1,0)), u.x), u.y),
      mix(mix(random(i+vec3(0,0,1)), random(i+vec3(1,0,1)), u.x),
          mix(random(i+vec3(0,1,1)), random(i+vec3(1,1,1)), u.x), u.y),
      u.z
    );
  }

  float fbm(vec3 p) {
    float v = 0.0, amp = 0.5;
    for (int i = 0; i < 6; i++) {
      v += amp * noise(p);
      p *= 2.0;
      amp *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float d = 1.0 - dot(uv, uv);
    if (d < 0.0) discard;

    // map UV onto sphere
    vec3 pos = vec3(uv, sqrt(d));

    // cloud / nebula
    vec3 coord = pos * u_cloud_density + u_time * 0.1;
    float c = fbm(coord);
    vec3 nebula = mix(u_color1, u_color2, smoothstep(0.4, 0.6, c));

    // Fresnel rim glow
    float fresnel = pow(1.0 - dot(normalize(pos), vec3(0,0,1)), 2.0)
                    * u_glow_intensity;
    vec3 glow = fresnel * u_color2;

    gl_FragColor = vec4(nebula + glow, 1.0);
  }
`;

const ShaderCanvas = memo(({
  color1 = 0xff5500, // Orange-Red core
  color2 = 0xffaa00, // Gold glow
  cloudDensity = 2.0,
  glowIntensity = 1.5,
  rotationSpeed = 0.2,
}) => {
  const mountRef = useRef(null);
  const threeRef = useRef({});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene + Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000); // Aspect 1 for square
    camera.position.z = 1.2;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Uniforms
    const uniforms = {
      u_time: { value: 0.0 },
      u_color1: { value: new THREE.Color(color1) },
      u_color2: { value: new THREE.Color(color2) },
      u_cloud_density: { value: cloudDensity },
      u_glow_intensity: { value: glowIntensity },
    };

    // Sphere
    const geo = new THREE.SphereGeometry(0.6, 64, 64);
    const mat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    });
    const sphere = new THREE.Mesh(geo, mat);
    scene.add(sphere);

    const clock = new THREE.Clock();
    threeRef.current = { renderer, scene, camera, uniforms, sphere, clock };

    // Resize
    function onResize() {
      if (!mountRef.current) return;
      const W = mountRef.current.clientWidth;
      const H = mountRef.current.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    }
    window.addEventListener('resize', onResize);
    onResize();

    // Loop
    let raf;
    const loop = () => {
      const { clock, sphere } = threeRef.current;
      if (!clock || !sphere) return;
      const delta = clock.getDelta();
      sphere.rotation.y += delta * rotationSpeed;
      sphere.rotation.z += delta * (rotationSpeed * 0.5);
      uniforms.u_time.value = clock.getElapsedTime();

      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [color1, color2, cloudDensity, glowIntensity, rotationSpeed]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full rounded-full"
      style={{ overflow: 'hidden' }}
    />
  );
});


/**
 * RADIAL ORBITAL TIMELINE
 */
function RadialOrbitalTimeline({ timelineData, onSelectVibe }) {
  const [expandedItems, setExpandedItems] = useState({});
  const [viewMode, setViewMode] = useState("orbital");
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [pulseEffect, setPulseEffect] = useState({});
  const [centerOffset, setCenterOffset] = useState({ x: 0, y: 0 });
  const [activeNodeId, setActiveNodeId] = useState(null);
  const containerRef = useRef(null);
  const orbitRef = useRef(null);
  const nodeRefs = useRef({});

  const handleContainerClick = (e) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key) !== id) {
          newState[parseInt(key)] = false;
        }
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);

        const relatedItems = getRelatedItems(id);
        const newPulseEffect = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);

        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  useEffect(() => {
    let rotationTimer;

    if (autoRotate && viewMode === "orbital") {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => {
          const newAngle = (prev + 0.2) % 360;
          return Number(newAngle.toFixed(3));
        });
      }, 50);
    }

    return () => {
      if (rotationTimer) {
        clearInterval(rotationTimer);
      }
    };
  }, [autoRotate, viewMode]);

  const centerViewOnNode = (nodeId) => {
    if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return;

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;
    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index, total) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 220;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian) + centerOffset.x;
    const y = radius * Math.sin(radian) + centerOffset.y;

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(
      0.4,
      Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))
    );

    return { x, y, angle, zIndex, opacity };
  };

  const getRelatedItems = (itemId) => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId) => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };

  return (
    <div
      className="w-full h-full min-h-[600px] flex flex-col items-center justify-center bg-neutral-950 overflow-hidden relative rounded-3xl border border-white/5"
      ref={containerRef}
      onClick={handleContainerClick}
    >
       {/* Instructions Overlay */}
       {!activeNodeId && (
         <div className="absolute top-8 left-0 right-0 text-center pointer-events-none z-20">
            <p className="text-neutral-500 text-sm uppercase tracking-widest">Click an orb to explore</p>
         </div>
       )}

      <div className="relative w-full max-w-4xl h-full flex items-center justify-center perspective-1000">
        <div
          className="absolute w-full h-full flex items-center justify-center preserve-3d"
          ref={orbitRef}
          style={{
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          }}
        >
          {/* Core / Center Shader */}
          <div className="absolute w-48 h-48 rounded-full flex items-center justify-center z-0 pointer-events-none">
             <ShaderCanvas
               color1="#4f46e5" // Indigo
               color2="#c026d3" // Fuchsia
               rotationSpeed={0.4}
               cloudDensity={3.5}
             />
          </div>

          {/* Core Rings */}
          <div className="absolute w-32 h-32 rounded-full border border-indigo-500/30 animate-ping opacity-20 pointer-events-none"></div>

          {/* Orbital Rings */}
          <div className="absolute w-[440px] h-[440px] rounded-full border border-white/5 border-dashed animate-spin-slow"></div>
          <div className="absolute w-[600px] h-[600px] rounded-full border border-white/5 opacity-30"></div>

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            const nodeStyle = {
              transform: `translate(${position.x}px, ${position.y}px)`,
              zIndex: isExpanded ? 200 : position.zIndex,
              opacity: isExpanded ? 1 : position.opacity,
            };

            return (
              <div
                key={item.id}
                ref={(el) => (nodeRefs.current[item.id] = el)}
                className="absolute transition-all duration-700 cursor-pointer"
                style={nodeStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                {/* Energy Field */}
                <div
                  className={`absolute rounded-full -inset-2 ${
                    isPulsing ? "animate-pulse duration-1000 bg-indigo-500/20" : ""
                  }`}
                  style={{
                    width: `${item.energy * 0.6 + 50}px`,
                    height: `${item.energy * 0.6 + 50}px`,
                    left: `-${(item.energy * 0.6 + 50 - 40) / 2}px`,
                    top: `-${(item.energy * 0.6 + 50 - 40) / 2}px`,
                  }}
                ></div>

                {/* Node Body */}
                <div
                  className={`
                  w-12 h-12 rounded-full flex items-center justify-center relative
                  ${
                    isExpanded
                      ? "bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                      : isRelated
                      ? "bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                      : "bg-neutral-900 text-white border border-white/20"
                  }
                  transition-all duration-300 transform
                  ${isExpanded ? "scale-125" : "hover:scale-110"}
                `}
                >
                  <Icon size={isExpanded ? 20 : 18} />

                  {!isExpanded && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                         <span className={`text-[10px] font-bold uppercase tracking-widest ${isRelated ? "text-indigo-400" : "text-neutral-500"}`}>
                           {item.title}
                         </span>
                    </div>
                  )}
                </div>

                {/* EXPANDED CARD */}
                {isExpanded && (
                  <Card className="absolute top-16 left-1/2 -translate-x-1/2 w-72 bg-black/80 backdrop-blur-xl border-white/10 shadow-2xl overflow-visible z-50 animate-in fade-in zoom-in-95 duration-300">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/50"></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border-indigo-500/20">
                          {item.category}
                        </Badge>
                        <span className="text-xs font-mono text-white/50">
                          {item.energy}% Energy
                        </span>
                      </div>
                      <CardTitle className="text-lg text-white">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-neutral-400 space-y-4">
                      <p>{item.content}</p>

                      <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                          style={{ width: `${item.energy}%` }}
                        ></div>
                      </div>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVibe(item.originalData);
                        }}
                        className="w-full gap-2 mt-2 bg-white text-black hover:bg-neutral-200"
                      >
                        Explore Movies <ArrowRight size={14} />
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * SIDEBAR COMPONENTS
 */
const SidebarContext = createContext(undefined);
const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider");
  return context;
};
const SidebarProvider = ({ children, open: openProp, setOpen: setOpenProp, animate = true }) => {
  const [openState, setOpenState] = useState(false);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;
  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};
const Sidebar = ({ children, open, setOpen, animate }) => (
  <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
    {children}
  </SidebarProvider>
);
const SidebarBody = (props) => (
  <>
    <DesktopSidebar {...props} />
    <MobileSidebar {...props} />
  </>
);
const DesktopSidebar = ({ className, children, ...props }) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn("h-full px-4 py-4 hidden md:flex md:flex-col bg-neutral-900 w-[300px] flex-shrink-0 border-r border-neutral-800", className)}
      animate={{ width: animate ? (open ? "300px" : "80px") : "300px" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
const MobileSidebar = ({ className, children, ...props }) => {
  const { open, setOpen } = useSidebar();
  return (
    <div className={cn("h-16 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-neutral-900 w-full border-b border-neutral-800", className)} {...props}>
      <div className="flex justify-between items-center z-20 w-full">
        <span className="font-bold text-xl text-white">CineVibe</span>
        <Menu className="text-neutral-200 cursor-pointer" onClick={() => setOpen(!open)} />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed h-full w-full inset-0 bg-neutral-900 p-10 z-[100] flex flex-col justify-between"
          >
            <div className="absolute right-10 top-10 z-50 text-neutral-200 cursor-pointer" onClick={() => setOpen(!open)}>
              <X />
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
const SidebarLink = ({ link, className, ...props }) => {
  const { open, animate } = useSidebar();
  return (
    <button 
      onClick={link.onClick} 
      className={cn("flex items-center justify-start gap-2 group/sidebar py-3 px-2 hover:bg-neutral-800 rounded-lg transition-colors w-full", className)} 
      {...props}
      aria-label={link.label}
    >
      {link.icon}
      <motion.span
        animate={{ display: animate ? (open ? "inline-block" : "none") : "inline-block", opacity: animate ? (open ? 1 : 0) : 1 }}
        className="text-neutral-200 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0 text-left"
      >
        {link.label}
      </motion.span>
    </button>
  );
};
const Logo = () => (
  <div className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
    <div className="h-6 w-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
      <Film className="text-white w-3 h-3" />
    </div>
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-xl text-white whitespace-pre">
      CineVibe
    </motion.span>
  </div>
);
const LogoIcon = () => (
  <div className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
    <div className="h-6 w-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
      <Film className="text-white w-3 h-3" />
    </div>
  </div>
);
const GlowButton = ({ children, onClick, className = "", disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`relative group px-8 py-3 rounded-full bg-neutral-900 text-white font-medium tracking-wide overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${className}`}
  >
    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
    <div className="absolute inset-0 w-full h-full border border-white/10 rounded-full" />
    <span className="relative flex items-center justify-center gap-2">{children}</span>
  </button>
);
const NeonInput = ({ value, onChange, placeholder, type = "text" }) => (
  <div className="relative group w-full max-w-md">
    <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
    <input 
      type={type} 
      value={value} 
      onChange={onChange} 
      placeholder={placeholder} 
      className="relative w-full bg-neutral-900 text-white border border-white/10 rounded-lg px-4 py-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder-neutral-500 transition-all" 
      aria-label={placeholder}
    />
  </div>
);

// --- CONFIG: GENRE MAPPINGS ---
const VIBES = [
  { id: 'hollywood', label: 'Hollywood', icon: Film, params: { with_original_language: 'en' }, desc: "Blockbuster hits and star-studded casts." },
  { id: 'bollywood', label: 'Bollywood', icon: Globe2, params: { with_original_language: 'hi', 'vote_count.gte': '50' }, desc: "Music, masala, and dramatic storytelling." },
  { id: 'horror', label: 'Horror', icon: Ghost, params: { with_genres: '27' }, desc: "Spine-chilling tales and jump scares." },
  { id: 'slasher', label: 'Slasher', icon: Skull, params: { with_genres: '53,27' }, desc: "Edge of your seat thriller and gore." },
  { id: 'romantic', label: 'Romance', icon: Heart, params: { with_genres: '10749' }, desc: "Love stories that melt your heart." },
  { id: 'heartbreak', label: 'Heartbreak', icon: HeartCrack, params: { with_genres: '18,10749' }, desc: "Sad movies for a good cry." },
  { id: 'action', label: 'Action', icon: Clapperboard, params: { with_genres: '28' }, desc: "High octane stunts and explosions." },
  { id: 'scifi', label: 'Sci-Fi', icon: Zap, params: { with_genres: '878' }, desc: "Futuristic adventures and technological wonders." },
  { id: 'comedy', label: 'Comedy', icon: Star, params: { with_genres: '35' }, desc: "Laughter and light-hearted entertainment." },
  { id: 'drama', label: 'Drama', icon: Calendar, params: { with_genres: '18' }, desc: "Emotionally engaging storytelling." },
  { id: 'thriller', label: 'Thriller', icon: Clock, params: { with_genres: '53' }, desc: "Suspenseful and gripping narratives." },
  { id: 'documentary', label: 'Documentary', icon: FileText, params: { with_genres: '99' }, desc: "Real-world stories and facts." },
  { id: 'tv_movie', label: 'TV Movie', icon: Tv, params: { with_genres: '10770' }, desc: "Movies made for television." },
  { id: 'adventure', label: 'Adventure', icon: LinkIcon, params: { with_genres: '12' }, desc: "Exciting journeys and epic quests." },
  { id: 'animation', label: 'Animation', icon: Star, params: { with_genres: '16' }, desc: "Animated features for all ages." }
];

// --- MAIN APP ---
export default function CineVibe() {
  const [apiKey, setApiKey] = useState(() => {
    // Try to get API key from localStorage first, then from environment
    return localStorage.getItem('tmdb_api_key') || '';
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // App State
  const [view, setView] = useState('selection'); // selection, results
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all', 'good', 'neutral', 'bad'
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Reviews Pagination State
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsTotalPages, setReviewsTotalPages] = useState(1);

  // Movie List Pagination State
  const [pageOffset, setPageOffset] = useState(0);

  // Transform VIBES to Timeline Data
  const vibeTimelineData = VIBES.map((v, index) => ({
    id: index + 1,
    title: v.label,
    date: "Discover",
    content: v.desc,
    category: "Genre",
    icon: v.icon,
    relatedIds: [(index + 1) % VIBES.length + 1, (index + 3) % VIBES.length + 1], // Create fake connections
    status: "in-progress",
    energy: Math.floor(Math.random() * 40) + 60, // Random energy 60-100
    originalData: v
  }));

  // --- HANDLERS ---
  const handleKeySubmit = async () => {
    if (!apiKey) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${apiKey}`);
      if (!res.ok) throw new Error('Invalid API Key');
      setIsAuthenticated(true);
      // Save the API key to localStorage for convenience (not ideal for production security)
      localStorage.setItem('tmdb_api_key', apiKey);
    } catch (err) {
      setError('Invalid API Key. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch 100 Movies (5 Pages x 20)
  const fetchMovies = async (vibe, offset = 0) => {
    if (!apiKey) {
      setError('API Key is required to fetch movies.');
      setView('selection');
      return;
    }
    
    setLoading(true);
    setSelectedVibe(vibe);
    setMovies([]);
    setError('');
    setPageOffset(offset);

    try {
      // Offset allows us to fetch pages 1-5, then 6-10, etc.
      const startPage = (offset * 5) + 1;
      const pages = [startPage, startPage + 1, startPage + 2, startPage + 3, startPage + 4];

      const requests = pages.map(page => {
        let queryParams = new URLSearchParams({
          api_key: apiKey,
          page: page.toString(),
          include_adult: 'false',
          sort_by: 'vote_average.desc',
          'vote_count.gte': '300', // Default
          ...vibe.params // Override (e.g., Bollywood uses 50)
        });
        return fetch(`https://api.themoviedb.org/3/discover/movie?${queryParams.toString()}`);
      });

      const responses = await Promise.all(requests);
      
      // Check if any response is not ok
      const allValid = responses.every(res => res.ok);
      if (!allValid) {
        throw new Error('Failed to fetch movies. Please try again.');
      }
      
      const data = await Promise.all(responses.map(res => res.json()));
      let allMovies = data.flatMap(d => d.results || []);
      allMovies = Array.from(new Map(allMovies.map(m => [m.id, m])).values()); // Dedupe
      allMovies.sort((a, b) => b.vote_average - a.vote_average); // Sort Desc
      setMovies(allMovies.slice(0, 100));
      setView('results');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch movies. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (selectedVibe) {
       fetchMovies(selectedVibe, pageOffset + 1); // Fetch next 5 pages
    }
  };

  // --- REVIEW LOGIC ---
  const fetchSingleReviewPage = async (movieId, page = 1) => {
    if (!apiKey) {
      throw new Error('API Key is required');
    }
    const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/reviews?api_key=${apiKey}&page=${page}`);
    return await res.json();
  };

  const openMovieDetails = async (movie) => {
    setSelectedMovie(movie);
    setReviewsLoading(true);
    setReviewFilter('all');
    setReviews([]);
    setFilteredReviews([]);
    setReviewsPage(1);

    try {
        // Fetch first 3 pages in parallel to get a diverse set of reviews immediately
        const p1 = fetchSingleReviewPage(movie.id, 1);
        const p2 = fetchSingleReviewPage(movie.id, 2);
        const p3 = fetchSingleReviewPage(movie.id, 3);

        const results = await Promise.all([p1, p2, p3]);

        let combinedReviews = [];
        let maxPage = 1;

        results.forEach(data => {
            if (data.results) {
                combinedReviews = [...combinedReviews, ...data.results];
            }
            if (data.total_pages > maxPage) maxPage = data.total_pages;
        });

        // Remove duplicates
        combinedReviews = Array.from(new Map(combinedReviews.map(item => [item.id, item])).values());

        setReviews(combinedReviews);
        setReviewsTotalPages(maxPage);
        setReviewsPage(3); // We fetched up to 3

    } catch (e) {
      console.error("Failed to fetch reviews", e);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadMoreReviews = async () => {
    if (reviewsPage >= reviewsTotalPages) return;
    const nextPage = reviewsPage + 1;
    setReviewsLoading(true);
    try {
        const data = await fetchSingleReviewPage(selectedMovie.id, nextPage);
        setReviews(prev => {
            const newReviews = [...prev, ...data.results];
            return Array.from(new Map(newReviews.map(item => [item.id, item])).values());
        });
        setReviewsPage(nextPage);
        setReviewsTotalPages(data.total_pages);
    } catch(e) {
         console.error("Failed to fetch more reviews");
    } finally {
        setReviewsLoading(false);
    }
  }

  // Smart Filtering Logic
  useEffect(() => {
    if (!reviews) return;

    let filtered = [...reviews];
    if (reviewFilter === 'good') {
      filtered = reviews.filter(r => r.author_details?.rating >= 7);
    } else if (reviewFilter === 'neutral') {
      filtered = reviews.filter(r => r.author_details?.rating >= 4 && r.author_details?.rating < 7);
    } else if (reviewFilter === 'bad') {
      filtered = reviews.filter(r => (r.author_details?.rating || 0) < 4);
    }

    setFilteredReviews(filtered);

    // AUTO-SCRAPE: If filter yields few results (<3) and we have more pages, fetch automatically
    if (reviewFilter !== 'all' && filtered.length < 3 && reviewsPage < reviewsTotalPages && !reviewsLoading) {
       console.log("Auto-fetching more reviews to find matches for:", reviewFilter);
       loadMoreReviews();
    }
  }, [reviewFilter, reviews, reviewsPage, reviewsTotalPages]);


  const closeModal = () => {
    setSelectedMovie(null);
    setReviews([]);
  };

  // Check for API key on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('tmdb_api_key');
    if (savedApiKey) {
      setIsAuthenticated(true);
    }
  }, []);

  // Modified Sidebar Links - Removed Logout
  const navLinks = [
    { label: "Discover Vibes", href: "#", onClick: () => setView('selection'), icon: <LayoutDashboard className="text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: "Top Rated", href: "#", onClick: () => fetchMovies({ id: 'top_rated', label: 'All Time Best', params: { sort_by: 'vote_average.desc', 'vote_count.gte': '1000' } }), icon: <Flame className="text-neutral-200 h-5 w-5 flex-shrink-0" /> },
    { label: "Trending", href: "#", onClick: () => fetchMovies({ id: 'trending', label: 'Trending Now', params: { sort_by: 'popularity.desc' } }), icon: <TrendingUp className="text-neutral-200 h-5 w-5 flex-shrink-0" /> },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-neutral-950 text-white relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
         <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] animate-slow-spin opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-violet-900/40 via-neutral-950 to-neutral-950 blur-3xl pointer-events-none" />
         <div className="z-10 space-y-8 text-center p-4">
            <div className="space-y-4">
               <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-neutral-500">CineVibe</h1>
               <p className="text-lg text-neutral-400 max-w-lg mx-auto">Enter your TMDB API Key to unlock a premium, curated movie discovery experience.</p>
            </div>
            <div className="w-full max-w-md mx-auto space-y-4">
              <NeonInput value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="Enter TMDB API Key" type="password" />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <GlowButton onClick={handleKeySubmit} disabled={loading || !apiKey} className="w-full">{loading ? <Loader2 className="animate-spin" /> : "Enter Cinematic Universe"}</GlowButton>
              <p className="text-xs text-neutral-600"><a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer noopener" className="underline hover:text-white">Get API Key</a></p>
            </div>
         </div>
         <style>{`@keyframes slow-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .animate-slow-spin { animation: slow-spin 30s linear infinite; }`}</style>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-neutral-950 overflow-hidden font-sans text-neutral-200 selection:bg-indigo-500/30">
       <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {sidebarOpen ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {navLinks.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div><SidebarLink link={{ label: "Settings", href: "#", icon: <Settings className="text-neutral-200 h-5 w-5 flex-shrink-0" /> }} /></div>
        </SidebarBody>
      </Sidebar>

      <div className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-950 relative">
         <div className="absolute inset-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none"></div>

         <main className="flex-1 overflow-y-auto p-4 md:p-8 z-10 scrollbar-hide">
            {/* VIEW: SELECTION (Replaced with Radial Timeline) */}
            {view === 'selection' && (
              <div className="w-full h-full flex flex-col">
                 <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Exploration Mode</h2>
                    <span className="text-xs text-neutral-500 uppercase tracking-widest">Orbital System Active</span>
                 </div>
                 <div className="flex-1 relative rounded-3xl overflow-hidden border border-white/5 bg-black/20">
                    <RadialOrbitalTimeline timelineData={vibeTimelineData} onSelectVibe={(vibe) => fetchMovies(vibe, 0)} />
                 </div>
              </div>
            )}

            {/* VIEW: RESULTS */}
            {view === 'results' && (
              <div className="animate-fade-in w-full max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8 sticky top-0 bg-neutral-950/80 backdrop-blur-lg py-4 z-20 border-b border-white/5">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setView('selection')} 
                        className="p-2 hover:bg-white/10 rounded-full transition"
                        aria-label="Back to selection"
                      >
                        <ArrowRight className="rotate-180" />
                      </button>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{selectedVibe?.label}</h2>
                        <p className="text-sm text-neutral-400">Top 100 Highest Rated • {movies.length} Results</p>
                      </div>
                    </div>
                    {/* NEW CONTENT BUTTON */}
                    <div className="flex items-center">
                      <GetStartedButton onClick={handleRefresh} loading={loading} />
                    </div>
                </div>
                {error && (
                  <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-20">
                    {movies.map((movie, idx) => (
                      <div 
                        key={`${movie.id}-${idx}`} 
                        onClick={() => openMovieDetails(movie)} 
                        className="group relative bg-neutral-900 border border-white/5 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 aspect-[2/3]"
                        role="button"
                        tabIndex="0"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            openMovieDetails(movie);
                          }
                        }}
                      >
                        <div className="absolute top-2 right-2 z-10 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-yellow-400 flex items-center gap-1 border border-white/10">
                          <Star size={10} fill="currentColor" /> {movie.vote_average?.toFixed(1) || 'N/A'}
                        </div>
                        <div className="absolute top-2 left-2 z-10 bg-indigo-600/80 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold text-white border border-indigo-500/50">#{(pageOffset * 100) + idx + 1}</div>
                        <img 
                          src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Image'} 
                          alt={movie.title || 'Movie poster'} 
                          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700" 
                          loading="lazy" 
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                          <h3 className="text-white font-semibold text-sm line-clamp-2">{movie.title}</h3>
                        </div>
                      </div>
                    ))}
                </div>
                
                {movies.length === 0 && !loading && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-xl text-neutral-400 mb-4">No movies found</p>
                    <p className="text-neutral-500">Try selecting a different genre or refresh the content</p>
                  </div>
                )}
              </div>
            )}

            {loading && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-neutral-950/80 backdrop-blur-sm">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <p className="text-indigo-200 animate-pulse text-lg">Curating {movies.length > 0 ? 'Next Batch' : '100 Masterpieces'}...</p>
              </div>
            )}
         </main>
      </div>

      <AnimatePresence>
      {selectedMovie && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
          aria-modal="true"
          role="dialog"
        >
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            onClick={closeModal} 
            aria-label="Close modal"
            role="button"
            tabIndex="0"
            onKeyDown={(e) => {
              if (e.key === 'Escape') closeModal();
            }}
          />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            exit={{ scale: 0.9, opacity: 0 }} 
            className="relative w-full max-w-5xl h-full max-h-[85vh] bg-neutral-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            <button 
              onClick={closeModal} 
              className="absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-white hover:text-black transition"
              aria-label="Close details"
            >
              <X size={20} />
            </button>
            <div className="w-full md:w-5/12 h-64 md:h-full relative bg-neutral-800">
               <img 
                 src={selectedMovie.poster_path ? `https://image.tmdb.org/t/p/original${selectedMovie.poster_path}` : 'https://via.placeholder.com/500x750'} 
                 alt={selectedMovie.title} 
                 className="w-full h-full object-cover" 
                 onError={(e) => {
                   e.target.src = 'https://via.placeholder.com/500x750?text=No+Image';
                 }}
               />
               <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent md:bg-gradient-to-r" />
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 bg-neutral-900/50">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">{selectedMovie.title}</h2>
                <div className="flex flex-wrap gap-3 text-sm text-neutral-400 mb-4">
                  <span className="px-2 py-1 bg-white/5 rounded-md border border-white/10">{selectedMovie.release_date?.split('-')[0]}</span>
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Star size={14} fill="currentColor" /> {selectedMovie.vote_average?.toFixed(1) || 'N/A'}
                  </span>
                  <span className="px-2 py-1 bg-white/5 rounded-md border border-white/10">{selectedMovie.vote_count || 0} votes</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Info size={18} className="text-indigo-500" /> Overview
                </h3>
                <p className="text-neutral-300 leading-relaxed text-sm md:text-base">
                  {selectedMovie.overview || "No description available."}
                </p>
              </div>

              {/* REVIEWS SECTION */}
              <div className="pt-6 border-t border-white/5">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <h3 className="text-lg font-semibold text-white">User Reviews</h3>

                  {/* Review Filters */}
                  <div className="flex items-center gap-2 bg-neutral-800/50 p-1 rounded-lg border border-white/5">
                    <button 
                      onClick={() => setReviewFilter('all')} 
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${reviewFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'}`}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => setReviewFilter('good')} 
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${reviewFilter === 'good' ? 'bg-green-600/20 text-green-400 border border-green-600/30' : 'text-neutral-400 hover:text-green-400'}`}
                    >
                      <ThumbsUp size={12} /> Good
                    </button>
                    <button 
                      onClick={() => setReviewFilter('neutral')} 
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${reviewFilter === 'neutral' ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30' : 'text-neutral-400 hover:text-yellow-400'}`}
                    >
                      <MinusCircle size={12} /> Neutral
                    </button>
                    <button 
                      onClick={() => setReviewFilter('bad')} 
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${reviewFilter === 'bad' ? 'bg-red-600/20 text-red-400 border border-red-600/30' : 'text-neutral-400 hover:text-red-400'}`}
                    >
                      <ThumbsDown size={12} /> Bad
                    </button>
                  </div>
                </div>

                {/* LOADING INDICATOR */}
                {reviewsLoading && (
                   <div className="flex justify-center py-8 animate-fade-in">
                     <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
                   </div>
                )}

                {/* REVIEWS LIST */}
                {!reviewsLoading && filteredReviews.length > 0 && (
                  <div className="space-y-4">
                    {filteredReviews.slice(0, 5).map((review) => (
                      <div key={review.id} className="bg-neutral-800/50 p-4 rounded-xl border border-white/5 hover:border-white/10 transition">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-indigo-400 text-sm">@{review.author}</span>
                          {review.author_details?.rating && (
                            <span className={`text-xs px-2 py-0.5 rounded font-mono ${review.author_details.rating >= 7 ? 'bg-green-500/10 text-green-500' : review.author_details.rating >= 4 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>
                              ★ {review.author_details.rating}/10
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-400 line-clamp-3 italic">"{review.content}"</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* EMPTY STATE */}
                {!reviewsLoading && filteredReviews.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-neutral-500 italic mb-2">No reviews found for this filter in the current batch.</p>
                      {reviewsPage < reviewsTotalPages && (
                         <button 
                           onClick={loadMoreReviews} 
                           className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1"
                         >
                           Try loading more reviews from page {reviewsPage + 1}... <Loader2 size={10} className="animate-spin" />
                         </button>
                      )}
                  </div>
                )}

                {/* READ MORE EXTERNAL BUTTON */}
                <div className="mt-6 flex justify-center">
                  <a
                    href={`https://www.themoviedb.org/movie/${selectedMovie.id}/reviews`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
                  >
                    Read all reviews on TMDB <ExternalLink size={14} />
                  </a>
                </div>

              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .animate-spin-slow { animation: spin 60s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-in { animation-duration: 0.3s; }
        .fade-in { animation-name: fadeIn; }
        .zoom-in-95 { animation-name: zoomIn95; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn95 { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}