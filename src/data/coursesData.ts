import { CourseFolder, LectureItem } from '../types/studio';

export const COURSES_DATA: CourseFolder[] = [
  {
    id: 'cs50-python',
    code: 'CS50P',
    number: '01',
    title: 'CS50 python',
    noteCount: 13,
    instructor: 'David J. Malan',
    progress: 84,
    description: 'An introduction to programming using Python, focusing on computational thinking and data structures.',
    color: '#10b981',
    notes: [
      {
        id: 'cs50-1',
        courseId: 'cs50-python',
        title: '00 | Functions, Variables & Scope',
        summary: 'Parameters, return values, type conversions, inner functions and string formatting.',
        tags: ['Python', 'Functions', 'Basics'],
        lastEdited: 'Yesterday',
        readTime: '4 min',
        content:
          'In Python, functions allow encapsulation of repeated computational logic. Functions accept positional and keyword arguments, returning values explicitly via `return`.\n\nKey Concepts:\n• String interpolation with f-strings\n• Default argument scoping\n• Type casting with `int()`, `float()`, `str()`',
        codeLanguage: 'python',
        codeSnippet: `def greet(name: str = "world") -> str:
    return f"Hello, {name.strip().title()}!"

if __name__ == "__main__":
    user_name = input("What is your name? ")
    print(greet(user_name))`
      },
      {
        id: 'cs50-2',
        courseId: 'cs50-python',
        title: '01 | Conditionals & Boolean Logic',
        summary: 'Match-case statements, boolean operators, truthiness, and ternary expressions.',
        tags: ['Conditionals', 'Logic'],
        lastEdited: '3 days ago',
        readTime: '3 min',
        content:
          'Python evaluates conditionals sequentially with short-circuit evaluation. Python 3.10 introduced structural pattern matching via `match ... case`.',
        codeLanguage: 'python',
        codeSnippet: `def handle_status(code: int) -> str:
    match code:
        case 200:
            return "OK"
        case 404:
            return "Not Found"
        case 500:
            return "Server Error"
        case _:
            return "Unknown"`
      },
      {
        id: 'cs50-3',
        courseId: 'cs50-python',
        title: '02 | Loops & List Comprehensions',
        summary: 'For-loops over iterables, while loops, break/continue, and expressive list comprehensions.',
        tags: ['Loops', 'Data Structures'],
        lastEdited: 'Sep 10',
        readTime: '5 min',
        content:
          'List comprehensions offer a concise syntax to transform iterables into new lists without verbose append loops.',
        codeLanguage: 'python',
        codeSnippet: `squares = [x**2 for x in range(10) if x % 2 == 0]
# [0, 4, 16, 36, 64]`
      },
      {
        id: 'cs50-4',
        courseId: 'cs50-python',
        title: '03 | Exceptions & Error Handling',
        summary: 'Try, except, else, finally blocks and raising custom exceptions.',
        tags: ['Exceptions', 'Robustness'],
        lastEdited: 'Sep 08',
        readTime: '4 min',
        content:
          'Robust error handling prevents unexpected crashes. Always catch specific exceptions rather than bare `except:`.',
        codeLanguage: 'python',
        codeSnippet: `while True:
    try:
        x = int(input("Enter an integer: "))
        break
    except ValueError:
        print("Invalid input. Please enter a valid number.")`
      },
      {
        id: 'cs50-5',
        courseId: 'cs50-python',
        title: '04 | Libraries & Virtual Environments',
        summary: 'Using pip, PyPI packages, sys.argv command line arguments, and creating custom modules.',
        tags: ['Modules', 'VirtualEnv'],
        lastEdited: 'Sep 05',
        readTime: '6 min',
        content: 'Modularity enables reusability. Virtual environments isolate dependency versions per project.',
      },
      {
        id: 'cs50-6',
        courseId: 'cs50-python',
        title: '05 | Unit Tests with Pytest',
        summary: 'Automated testing, assertions, test fixtures, and edge case coverage.',
        tags: ['Testing', 'Pytest'],
        lastEdited: 'Sep 01',
        readTime: '4 min',
        content: 'Unit tests guarantee regressions are caught early before deploying to production.',
      },
      {
        id: 'cs50-7',
        courseId: 'cs50-python',
        title: '06 | File I/O & CSV Processing',
        summary: 'Reading/writing files with context managers, DictReader, and JSON serialization.',
        tags: ['FileIO', 'CSV', 'JSON'],
        lastEdited: 'Aug 28',
        readTime: '5 min',
        content: 'Context managers (`with open(...) as f:`) guarantee clean descriptor closure.',
      },
      {
        id: 'cs50-8',
        courseId: 'cs50-python',
        title: '07 | Regular Expressions & Parsing',
        summary: 'Pattern matching, capture groups, email validation, and regex efficiency.',
        tags: ['Regex', 'Parsing'],
        lastEdited: 'Aug 24',
        readTime: '6 min',
        content: 'Regex allows powerful validation and extraction of structured string patterns.',
      },
      {
        id: 'cs50-9',
        courseId: 'cs50-python',
        title: '08 | Object-Oriented Programming (OOP)',
        summary: 'Classes, dunder methods (__init__, __str__), getters, setters, and inheritance.',
        tags: ['OOP', 'Classes'],
        lastEdited: 'Aug 20',
        readTime: '7 min',
        content: 'Classes package data and behavior together with encapsulation and properties.',
      },
      {
        id: 'cs50-10',
        courseId: 'cs50-python',
        title: '09 | Et Cetera: Generators & Decorators',
        summary: 'Yield expressions, function decorators, map, filter, and args/kwargs unpackers.',
        tags: ['Advanced', 'Decorators'],
        lastEdited: 'Aug 16',
        readTime: '5 min',
        content: 'Decorators wrap and modify function behavior dynamically at definition time.',
      },
      {
        id: 'cs50-11',
        courseId: 'cs50-python',
        title: '10 | Computational Complexity & Big-O',
        summary: 'Time and space complexity of sorting, searching, and dictionary lookups.',
        tags: ['Algorithms', 'Big-O'],
        lastEdited: 'Aug 12',
        readTime: '8 min',
        content: 'Understanding Big-O notation is essential for writing scalable algorithms.',
      },
      {
        id: 'cs50-12',
        courseId: 'cs50-python',
        title: '11 | Working with Web APIs & Requests',
        summary: 'HTTP methods, status codes, query parameters, and handling JSON payloads.',
        tags: ['Networking', 'APIs'],
        lastEdited: 'Aug 08',
        readTime: '5 min',
        content: 'Connecting to REST APIs enables real-time data ingestion and external automation.',
      },
      {
        id: 'cs50-13',
        courseId: 'cs50-python',
        title: '12 | Final Project Architecture',
        summary: 'Full-stack CLI and GUI application architecture, design patterns, and deployment.',
        tags: ['Project', 'Architecture'],
        lastEdited: 'Aug 04',
        readTime: '9 min',
        content: 'Synthesis of all course topics into a maintainable, tested software release.',
      },
    ],
  },
  {
    id: 'mobile-app',
    code: 'CS193A',
    number: '02',
    title: 'Mobile Application',
    noteCount: 11,
    instructor: 'Prof. Stanford Engineering',
    progress: 68,
    description: 'Cross-platform mobile development with modern React Native, Skia graphics, and native bridges.',
    color: '#0284c7',
    notes: [
      {
        id: 'mob-1',
        courseId: 'mobile-app',
        title: '00 | React Native Architecture & Fabric',
        summary: 'The new C++ architecture, JSI (JavaScript Interface), and TurboModules.',
        tags: ['ReactNative', 'Fabric', 'JSI'],
        lastEdited: 'Yesterday',
        readTime: '6 min',
        content:
          'The new React Native architecture eliminates the legacy asynchronous JSON bridge in favor of direct C++ HostObjects accessed via JSI with zero serialization overhead.',
        codeLanguage: 'typescript',
        codeSnippet: `// Direct synchronous access through JSI
export function getHardwareSpecs(): { cores: number; memoryMB: number } {
  return global.__nativeDeviceSpecs?.();
}`
      },
      {
        id: 'mob-2',
        courseId: 'mobile-app',
        title: '01 | Gesture Handler & Reanimated 3',
        summary: '60/120 FPS animations on the UI thread using worklets and shared values.',
        tags: ['Animation', 'Gestures'],
        lastEdited: '2 days ago',
        readTime: '5 min',
        content: 'Worklets run small JavaScript functions synchronously on the native UI thread.',
      },
      {
        id: 'mob-3',
        courseId: 'mobile-app',
        title: '02 | Skia Canvas & Liquid Glass Shaders',
        summary: 'Real-time GLSL shader filters, chromatic distortion, and GPU backdrops on iOS & Android.',
        tags: ['Skia', 'Shaders', 'Graphics'],
        lastEdited: 'Sep 12',
        readTime: '7 min',
        content: 'Shopify React Native Skia allows executing custom GLSL runtime shaders directly on mobile GPUs.',
      },
      {
        id: 'mob-4',
        courseId: 'mobile-app',
        title: '03 | Navigation & Deep Linking',
        summary: 'Expo Router file-based routing, stack transitions, modal sheets, and universal links.',
        tags: ['Routing', 'ExpoRouter'],
        lastEdited: 'Sep 09',
        readTime: '4 min',
        content: 'File-based routing provides automatic TypeScript type-safety for deep link URLs.',
      },
      {
        id: 'mob-5',
        courseId: 'mobile-app',
        title: '04 | Offline State & WatermelonDB',
        summary: 'SQLite local synchronization, observable queries, and conflict resolution.',
        tags: ['Database', 'Offline'],
        lastEdited: 'Sep 06',
        readTime: '6 min',
        content: 'Offline-first apps cache mutations locally and replay sync deltas when online.',
      },
      {
        id: 'mob-6',
        courseId: 'mobile-app',
        title: '05 | Biometric Authentication & Secure Storage',
        summary: 'Face ID, Fingerprint, and iOS Keychain / Android KeyStore token preservation.',
        tags: ['Security', 'Biometrics'],
        lastEdited: 'Sep 02',
        readTime: '5 min',
        content: 'Tokens must never be stored in plain AsyncStorage; use hardware-backed Keychain storage.',
      },
      {
        id: 'mob-7',
        courseId: 'mobile-app',
        title: '06 | Push Notifications & Background Tasks',
        summary: 'APNs, FCM integration, background fetch, and silent state updates.',
        tags: ['Notifications', 'APNs'],
        lastEdited: 'Aug 29',
        readTime: '5 min',
        content: 'Background execution is severely throttled by OS power management policies.',
      },
      {
        id: 'mob-8',
        courseId: 'mobile-app',
        title: '07 | Camera, Vision & Image Processing',
        summary: 'Camera2 and AVFoundation frame processors for barcode and face detection.',
        tags: ['Camera', 'Vision'],
        lastEdited: 'Aug 25',
        readTime: '7 min',
        content: 'Real-time frame processing requires zero-copy image buffers.',
      },
      {
        id: 'mob-9',
        courseId: 'mobile-app',
        title: '08 | In-App Purchases & Subscriptions',
        summary: 'StoreKit 2, Google Play Billing, server-side receipt validation with StoreKit JWS.',
        tags: ['Monetization', 'StoreKit'],
        lastEdited: 'Aug 21',
        readTime: '6 min',
        content: 'StoreKit 2 provides async/await Swift native transaction listeners and signed JWS tokens.',
      },
      {
        id: 'mob-10',
        courseId: 'mobile-app',
        title: '09 | Native iOS Swift & Android Kotlin Modules',
        summary: 'Authoring custom native modules using modern Swift Concurrency and Kotlin Coroutines.',
        tags: ['Swift', 'Kotlin', 'Native'],
        lastEdited: 'Aug 17',
        readTime: '8 min',
        content: 'Bridging low-level OS sensors and proprietary SDKs via native modules.',
      },
      {
        id: 'mob-11',
        courseId: 'mobile-app',
        title: '10 | Profiling, FPS & Hermes Memory Optimization',
        summary: 'Flipper, React DevTools, Hermes bytecode profiling, and reducing JS thread lag.',
        tags: ['Performance', 'Hermes'],
        lastEdited: 'Aug 13',
        readTime: '6 min',
        content: 'Hermes pre-compiles JS into bytecode at build time for instant app start up.',
      },
    ],
  },
  {
    id: 'web-threejs',
    code: 'CS294',
    number: '03',
    title: 'Web Development & Three.js',
    noteCount: 2,
    instructor: 'Graphics Lab',
    progress: 95,
    description: 'Advanced WebGL2 shaders, physical refraction, Snell law optical physics, and glass dispersion.',
    color: '#06b6d4',
    notes: [
      {
        id: 'w3-1',
        courseId: 'web-threejs',
        title: '00 | Snell\'s Law & Chromatic Dispersion',
        summary: 'Physical index of refraction (IOR 1.4-3.0), RGB wavelength split, and Fresnel reflectance.',
        tags: ['WebGL', 'Snell', 'Optics'],
        lastEdited: 'Today',
        readTime: '5 min',
        content:
          'When light enters a dense optical medium like fluid glass, it bends according to Snell\'s law: n1 * sin(θ1) = n2 * sin(θ2).\n\nBecause violet wavelengths bend more than red wavelengths, splitting the IOR per channel produces spectral dispersion.',
        codeLanguage: 'glsl',
        codeSnippet: `// Snell's Law Chromatic Split in GLSL
float iorR = u_ior - u_dispersion * 0.04;
float iorG = u_ior;
float iorB = u_ior + u_dispersion * 0.04;

vec3 refR = refract(I, N, 1.0 / iorR);
vec3 refG = refract(I, N, 1.0 / iorG);
vec3 refB = refract(I, N, 1.0 / iorB);`
      },
      {
        id: 'w3-2',
        courseId: 'web-threejs',
        title: '01 | Signed Distance Fields (SDF) for Glass Panels',
        summary: 'Rounded rectangle distance functions, normal vector gradients, and bevel curvatures.',
        tags: ['SDF', 'GLSL', 'Shaders'],
        lastEdited: 'Yesterday',
        readTime: '7 min',
        content:
          'Analytic Signed Distance Fields allow pixel-perfect rounded glass surfaces at arbitrary resolutions without geometry tessellation.',
        codeLanguage: 'glsl',
        codeSnippet: `float sdRoundedBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + vec2(r);
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}`
      },
    ],
  },
];

export const CS50_LECTURES: LectureItem[] = [
  {
    id: 'lec-0',
    lectureNumber: 0,
    title: 'Functions & Variables',
    duration: '2h 15m',
    topic: 'Core Syntax, I/O, Strings',
    summary: 'Introduction to Python syntax, print formatting, input handling, functions, parameters, and variable scope.',
    keyConcepts: ['Variables', 'f-strings', 'Functions', 'Def', 'Return'],
    codeSample: 'print(f"Hello, {input(\'Name: \').strip().title()}")',
    completed: true,
  },
  {
    id: 'lec-1',
    lectureNumber: 1,
    title: 'Conditionals',
    duration: '1h 50m',
    topic: 'Boolean Logic, Match-Case',
    summary: 'Decision making in Python, if/elif/else, logical operators (and, or, not), and structural pattern matching.',
    keyConcepts: ['If/Elif/Else', 'Boolean', 'Modulo', 'Match'],
    codeSample: 'match score:\n    case 100: print("Perfect")\n    case _: print("Keep going")',
    completed: true,
  },
  {
    id: 'lec-2',
    lectureNumber: 2,
    title: 'Loops',
    duration: '2h 05m',
    topic: 'Iteration, While, For',
    summary: 'Iterating through data structures, while loops, for loops with range, dictionaries, and list iteration.',
    keyConcepts: ['While', 'For', 'Lists', 'Dicts', 'Break'],
    codeSample: 'for student in ["Harry", "Ron", "Hermione"]:\n    print(student)',
    completed: true,
  },
  {
    id: 'lec-3',
    lectureNumber: 3,
    title: 'Exceptions',
    duration: '1h 40m',
    topic: 'Defensive Programming',
    summary: 'Handling runtime exceptions gracefully using try, except, else, and finally.',
    keyConcepts: ['ValueError', 'ZeroDivisionError', 'Try/Except', 'Pass'],
    codeSample: 'try:\n    x = int(input("x: "))\nexcept ValueError:\n    print("Not an integer")',
    completed: true,
  },
  {
    id: 'lec-4',
    lectureNumber: 4,
    title: 'Libraries',
    duration: '2h 10m',
    topic: 'Packages & Modules',
    summary: 'Random module, statistics, command-line arguments with sys, third-party packages, and requests API.',
    keyConcepts: ['Import', 'Pip', 'PyPI', 'sys.argv', 'Requests'],
    codeSample: 'import sys\nif len(sys.argv) > 1:\n    print(f"Hello, {sys.argv[1]}")',
    completed: false,
  },
  {
    id: 'lec-5',
    lectureNumber: 5,
    title: 'Unit Tests',
    duration: '1h 35m',
    topic: 'Testing with pytest',
    summary: 'Writing automated test suites, assert statements, test categorization, and exception assertions.',
    keyConcepts: ['Pytest', 'Assert', 'Test automation'],
    codeSample: 'def test_square():\n    assert square(2) == 4\n    assert square(-3) == 9',
    completed: false,
  },
  {
    id: 'lec-6',
    lectureNumber: 6,
    title: 'File I/O',
    duration: '2h 00m',
    topic: 'Data Persistence',
    summary: 'Writing and reading textual files, CSV tables with DictReader, sorting files, and image manipulation.',
    keyConcepts: ['Open', 'Read/Write', 'CSV', 'Pillow'],
    codeSample: 'with open("students.csv") as file:\n    for line in file:\n        row = line.rstrip().split(",")',
    completed: false,
  },
  {
    id: 'lec-7',
    lectureNumber: 7,
    title: 'Regular Expressions',
    duration: '2h 20m',
    topic: 'Pattern Matching',
    summary: 'Validating and formatting patterns using re module, metacharacters, sets, and capture groups.',
    keyConcepts: ['re.search', 'Quantifiers', 'Groups'],
    codeSample: 'import re\nemail = input("Email: ")\nif re.search(r"^\\w+@\\w+\\.(edu|com)$", email):\n    print("Valid")',
    completed: false,
  },
  {
    id: 'lec-8',
    lectureNumber: 8,
    title: 'Object-Oriented Programming',
    duration: '2h 30m',
    topic: 'Classes & Encapsulation',
    summary: 'Designing classes, object instantiation, dunder methods, properties with getters and setters, inheritance.',
    keyConcepts: ['Classes', '__init__', 'Encapsulation', '@property'],
    codeSample: 'class Student:\n    def __init__(self, name, house):\n        self.name = name\n        self.house = house',
    completed: false,
  },
];
