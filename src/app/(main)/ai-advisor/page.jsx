'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { fmt } from '@/lib/validation'
import { useProducts } from '@/hooks/useProducts'
import { useAuth } from '@/context/AuthContext'
import { saveRunningProfile, getUserData } from '@/services/userService'
import { getAdvisorRecommendations } from '@/services/aiSearchService'


const QUESTIONS = [
  {
    id: 'training',
    question: 'What will you primarily use the shoe for?',
    sub: 'This helps us match the right shoe construction and support for your activity.',
    options: [
      {
        value: 'daily_training',
        label: 'Daily Training',
        desc: 'Regular runs, building base mileage',
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v240h-80v-80H200v400h280v80H200ZM760 0q-73 0-127.5-45.5T564-160h62q13 44 49.5 72T760-60q58 0 99-41t41-99q0-58-41-99t-99-41q-29 0-54 10.5T662-300h58v60H560v-160h60v57q27-26 63-41.5t77-15.5q83 0 141.5 58.5T960-200q0 83-58.5 141.5T760 0ZM200-640h560v-80H200v80Zm0 0v-80 80Z" /></svg>
      },
      {
        value: 'long_distance',
        label: 'Long Distance',
        desc: 'Half marathons, marathons, ultras',
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="M307-113.5Q240-147 240-200q0-24 14.5-44.5T295-280l63 59q-9 4-19.5 9T322-200q13 16 60 28t98 12q51 0 98.5-12t60.5-28q-7-8-18-13t-21-9l62-60q28 16 43 36.5t15 45.5q0 53-67 86.5T480-80q-106 0-173-33.5ZM481-300q99-73 149-146.5T680-594q0-102-65-154t-135-52q-70 0-135 52t-65 154q0 67 49 139.5T481-300Zm-1 100Q339-304 269.5-402T200-594q0-71 25.5-124.5T291-808q40-36 90-54t99-18q49 0 99 18t90 54q40 36 65.5 89.5T760-594q0 94-69.5 192T480-200Zm0-320q33 0 56.5-23.5T560-600q0-33-23.5-56.5T480-680q-33 0-56.5 23.5T400-600q0 33 23.5 56.5T480-520Zm0-80Z" /></svg>
      },
      {
        value: 'speed_work',
        label: 'Speed & Racing',
        desc: 'Intervals, tempo runs, races',
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="M480-316.5q38-.5 56-27.5l224-336-336 224q-27 18-28.5 55t22.5 61q24 24 62 23.5Zm0-483.5q59 0 113.5 16.5T696-734l-76 48q-33-17-68.5-25.5T480-720q-133 0-226.5 93.5T160-400q0 42 11.5 83t32.5 77h552q23-38 33.5-79t10.5-85q0-36-8.5-70T766-540l48-76q30 47 47.5 100T880-406q1 57-13 109t-41 99q-11 18-30 28t-40 10H204q-21 0-40-10t-30-28q-26-45-40-95.5T80-400q0-83 31.5-155.5t86-127Q252-737 325-768.5T480-800Zm7 313Z" /></svg>
      },
      {
        value: 'gym_cross',
        label: 'Gym & Cross Training',
        desc: 'Mixed workouts, strength + cardio',
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="m826-585-56-56 30-31-128-128-31 30-57-57 30-31q23-23 57-22.5t57 23.5l129 129q23 23 23 56.5T857-615l-31 30ZM346-104q-23 23-56.5 23T233-104L104-233q-23-23-23-56.5t23-56.5l30-30 57 57-31 30 129 129 30-31 57 57-30 30Zm397-336 57-57-303-303-57 57 303 303ZM463-160l57-58-302-302-58 57 303 303Zm-6-234 110-109-64-64-109 110 63 63Zm63 290q-23 23-57 23t-57-23L104-406q-23-23-23-57t23-57l57-57q23-23 56.5-23t56.5 23l63 63 110-110-63-62q-23-23-23-57t23-57l57-57q23-23 56.5-23t56.5 23l303 303q23 23 23 56.5T857-441l-57 57q-23 23-57 23t-57-23l-62-63-110 110 63 63q23 23 23 56.5T577-161l-57 57Z" /></svg>
      },
    ],
  },
  {
    id: 'arch',
    question: 'What is your arch type?',
    sub: "If you're unsure, wet your foot and step on paper — a full imprint means flat feet.",
    options: [
      {
        value: 'neutral',
        label: 'Neutral Arch',
        desc: 'Normal curve, most common',
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="m684-389 179-179 57 57-180 179-56-57ZM40-160v-106q0-24 13.5-44T90-339q21-8 40-19t38-25l58 58q5 7 13.5 6.5T254-325q5-5 5-13.5t-5-15.5l-55-55 15.5-15.5Q222-432 230-441l54 55q5 7 13.5 7t15.5-7q5-5 5-13.5t-5-15.5l-55-54q5-10 10.5-20.5T278-512l65 65q5 7 13.5 7t15.5-7q5-5 5-13t-5-15l-77-77 41-114 216-214 282 283-414 437H40Zm345-80 337-355-337 355Zm-265 0h265l337-355-171-171-146 145-29 81 30 30q23 24 23 57.5T406-396L293-283q-24 24-57 24t-56-24l-8-8q-13 8-26 14t-26 11v26Z" /></svg>
      },
      {
        value: 'flat',
        label: 'Flat Feet',
        desc: 'Low or no arch (overpronation)',
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="M216-580q39 0 74 14t64 41l382 365h24q17 0 28.5-11.5T800-200q0-8-1.5-17T788-235L605-418l-71-214-74 18q-38 10-69-14t-31-63v-84l-28-14-154 206q-1 1-1 1.5t-1 1.5h40Zm0 80h-46q3 7 7.5 13t10.5 11l324 295q11 11 25 16t29 5h54L299-467q-17-17-38.5-25t-44.5-8ZM566-80q-30 0-57-11t-50-31L134-417q-46-42-51.5-103T114-631l154-206q17-23 45.5-30.5T368-861l28 14q21 11 32.5 30t11.5 42v84l74-19q30-8 58 7.5t38 44.5l65 196 170 170q20 20 27.5 43t7.5 49q0 50-35 85t-85 35H566Z" /></svg>
      },
      {
        value: 'high',
        label: 'High Arch',
        desc: 'Strong curve, underpronation',
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="M191.5-651.5Q180-663 180-680t11.5-28.5Q203-720 220-720t28.5 11.5Q260-697 260-680t-11.5 28.5Q237-640 220-640t-28.5-11.5ZM400-80q-66 0-113-47t-47-113v-240q0-100 70-170t170-70h73q69 0 118 46.5T720-559q0 46-24.5 84.5T629-416q-32 15-50.5 44.5T560-307v67q0 67-46.5 113.5T400-80ZM291.5-731.5Q280-743 280-760v-20q0-17 11.5-28.5T320-820q17 0 28.5 11.5T360-780v20q0 17-11.5 28.5T320-720q-17 0-28.5-11.5Zm165 548Q480-207 480-240v-67q0-58 30.5-107t83.5-74q21-10 33.5-29.5T640-560q0-35-26-57.5T553-640h-73q-66 0-113 47t-47 113v240q0 33 23.5 56.5T400-160q33 0 56.5-23.5Zm-45-588Q400-783 400-800v-20q0-17 11.5-28.5T440-860q17 0 28.5 11.5T480-820v20q0 17-11.5 28.5T440-760q-17 0-28.5-11.5Zm120 0Q520-783 520-800v-40q0-17 11.5-28.5T560-880q17 0 28.5 11.5T600-840v40q0 17-11.5 28.5T560-760q-17 0-28.5-11.5Zm126 34Q640-755 640-780v-40q0-25 17.5-42.5T700-880q25 0 42.5 17.5T760-820v40q0 25-17.5 42.5T700-720q-25 0-42.5-17.5ZM400-480Z" /></svg>
      },
      {
        value: 'unsure',
        label: 'Not Sure',
        desc: "We'll recommend something versatile",
        icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="M424-320q0-81 14.5-116.5T500-514q41-36 62.5-62.5T584-637q0-41-27.5-68T480-732q-51 0-77.5 31T365-638l-103-44q21-64 77-111t141-47q105 0 161.5 58.5T698-641q0 50-21.5 85.5T609-475q-49 47-59.5 71.5T539-320H424Zm56 240q-33 0-56.5-23.5T400-160q0-33 23.5-56.5T480-240q33 0 56.5 23.5T560-160q0 33-23.5 56.5T480-80Z" /></svg>
      },
    ],
  },
{
  id: 'terrain',
  question: 'Where do you mostly run?',
  sub: 'Your primary surface determines the outsole and grip you need.',
  options: [
    {
      value: 'road',
      label: 'Road / Pavement',
      desc: 'Tarmac, concrete, urban',
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="M160-160v-640h80v640h-80Zm280 0v-160h80v160h-80Zm280 0v-640h80v640h-80ZM440-400v-160h80v160h-80Zm0-240v-160h80v160h-80Z"/></svg>
    },
    {
      value: 'trail',
      label: 'Trail / Off-road',
      desc: 'Dirt, gravel, forest paths',
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="M280-80v-160H0l154-240H80l280-400 120 172 120-172 280 400h-74l154 240H680v160H520v-160h-80v160H280Zm389-240h145L659-560h67L600-740l-71 101 111 159h-74l103 160Zm-523 0h428L419-560h67L360-740 234-560h67L146-320Zm0 0h155-67 252-67 155-428Zm523 0H566h74-111 197-67 155-145Zm-149 80h160-160Zm201 0Z"/></svg>
    },
    {
      value: 'treadmill',
      label: 'Treadmill',
      desc: 'Indoor gym running',
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="M520-240v-143l-45-49-21 106-150-31 8-39 111 23 39-196-62 23v66h-40v-94l131-48q15-5 29.5 1t21.5 20q25 51 55.5 66t42.5 15v40q-21 0-55-16.5T524-550l-17 94 53 57v159h-40Zm20-400q-17 0-28.5-11.5T500-680q0-17 11.5-28.5T540-720q17 0 28.5 11.5T580-680q0 17-11.5 28.5T540-640ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"/></svg>
    },
    {
      value: 'mixed',
      label: 'Mixed surfaces',
      desc: 'Bit of everything',
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="M232-131q-12 11-29 10.5T175-133q-35-38-57-84t-22-98q0-50 14-97t34-92q15-36 28-72.5t13-75.5q0-35-18-65t-44-54q-12-11-12-27.5t11-28.5q11-12 27.5-12.5T178-829q38 35 62.5 80t24.5 97q0 47-13.5 91.5T219-473q-17 38-30 76.5T176-316q0 37 16 69.5t42 59.5q11 12 10.5 28.5T232-131Zm160 0q-12 11-29 10.5T335-133q-35-38-57-84t-22-98q0-50 14-97t34-92q15-36 28-72.5t13-75.5q0-35-18-65t-44-54q-12-11-12-27.5t11-28.5q11-12 27.5-12.5T338-829q38 35 62.5 80t24.5 97q0 47-13.5 91T379-474q-17 38-30 77t-13 81q0 37 16 69.5t42 59.5q11 12 10.5 28.5T392-131Zm88 11v-720q0-17 11.5-28.5T520-880q17 0 28.5 11.5T560-840v126l102-101q11-11 27.5-11t28.5 12q11 11 11 28t-11 28L560-600v80h80l158-158q11-11 28-11t28 11q11 11 11 28t-11 28L754-520h126q17 0 28.5 11.5T920-480q0 17-11.5 28.5T880-440H754l101 102q11 11 11 27.5T854-282q-11 11-28 11t-28-11L640-440h-80v80l158 158q11 11 11 28t-11 28q-11 11-28 11t-28-11L560-246v126q0 17-11.5 28.5T520-80q-17 0-28.5-11.5T480-120Z"/></svg>
    },
  ],
},
{
  id: 'experience',
  question: 'What is your running experience?',
  sub: 'This helps us match cushioning and support levels.',
  options: [
    {
      value: 'beginner',
      label: 'Beginner',
      desc: 'Just starting out, < 6 months',
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="M423.5-743.5Q400-767 400-800t23.5-56.5Q447-880 480-880t56.5 23.5Q560-833 560-800t-23.5 56.5Q513-720 480-720t-56.5-23.5ZM360-80v-520q-60-5-122-15t-118-25l20-80q78 21 166 30.5t174 9.5q86 0 174-9.5T820-720l20 80q-56 15-118 25t-122 15v520h-80v-240h-80v240h-80Z"/></svg>
    },
    {
      value: 'intermediate',
      label: 'Intermediate',
      desc: '6 months – 2 years',
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="m363-310 117-71 117 71-31-133 104-90-137-11-53-126-53 126-137 11 104 90-31 133ZM480-28 346-160H160v-186L28-480l132-134v-186h186l134-132 134 132h186v186l132 134-132 134v186H614L480-28Zm0-112 100-100h140v-140l100-100-100-100v-140H580L480-820 380-720H240v140L140-480l100 100v140h140l100 100Zm0-340Z"/></svg>
    },
    {
      value: 'advanced',
      label: 'Advanced',
      desc: '2+ years, regular mileage',
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="M607.5-212.5Q660-265 660-340t-52.5-127.5Q555-520 480-520t-127.5 52.5Q300-415 300-340t52.5 127.5Q405-160 480-160t127.5-52.5ZM363-572q20-11 42.5-17.5T451-598L350-800H250l113 228Zm234 0 114-228H610l-85 170 19 38q14 4 27 8.5t26 11.5ZM256-208q-17-29-26.5-62.5T220-340q0-36 9.5-69.5T256-472q-42 14-69 49.5T160-340q0 47 27 82.5t69 49.5Zm448 0q42-14 69-49.5t27-82.5q0-47-27-82.5T704-472q17 29 26.5 62.5T740-340q0 36-9.5 69.5T704-208ZM403.5-91.5Q367-103 336-123q-9 2-18 2.5t-19 .5q-91 0-155-64T80-339q0-87 58-149t143-69L120-880h280l80 160 80-160h280L680-559q85 8 142.5 70T880-340q0 92-64 156t-156 64q-9 0-18.5-.5T623-123q-31 20-67 31.5T480-80q-40 0-76.5-11.5ZM480-340ZM363-572 250-800l113 228Zm234 0 114-228-114 228ZM406-230l28-91-74-53h91l29-96 29 96h91l-74 53 28 91-74-56-74 56Z"/></svg>
    },
    {
      value: 'competitive',
      label: 'Competitive',
      desc: 'Racing, speed training',
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="M280-120v-80h160v-124q-49-11-87.5-41.5T296-442q-75-9-125.5-65.5T120-640v-40q0-33 23.5-56.5T200-760h80v-80h400v80h80q33 0 56.5 23.5T840-680v40q0 76-50.5 132.5T664-442q-18 46-56.5 76.5T520-324v124h160v80H280Zm0-408v-152h-80v40q0 38 22 68.5t58 43.5Zm285 93q35-35 35-85v-240H360v240q0 50 35 85t85 35q50 0 85-35Zm115-93q36-13 58-43.5t22-68.5v-40h-80v152Zm-200-52Z"/></svg>
    },
  ],
},
{
  id: 'cushion',
  question: 'How much cushioning do you prefer?',
  sub: 'More cushion = softer but heavier. Less = lighter but more ground feel.',
  options: [
    {
      value: 'minimal',
      label: 'Minimal',
      desc: 'Barefoot-like, max ground feel',
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="M191.5-651.5Q180-663 180-680t11.5-28.5Q203-720 220-720t28.5 11.5Q260-697 260-680t-11.5 28.5Q237-640 220-640t-28.5-11.5ZM400-80q-66 0-113-47t-47-113v-240q0-100 70-170t170-70h73q69 0 118 46.5T720-559q0 46-24.5 84.5T629-416q-32 15-50.5 44.5T560-307v67q0 67-46.5 113.5T400-80ZM291.5-731.5Q280-743 280-760v-20q0-17 11.5-28.5T320-820q17 0 28.5 11.5T360-780v20q0 17-11.5 28.5T320-720q-17 0-28.5-11.5Zm165 548Q480-207 480-240v-67q0-58 30.5-107t83.5-74q21-10 33.5-29.5T640-560q0-35-26-57.5T553-640h-73q-66 0-113 47t-47 113v240q0 33 23.5 56.5T400-160q33 0 56.5-23.5Zm-45-588Q400-783 400-800v-20q0-17 11.5-28.5T440-860q17 0 28.5 11.5T480-820v20q0 17-11.5 28.5T440-760q-17 0-28.5-11.5Zm120 0Q520-783 520-800v-40q0-17 11.5-28.5T560-880q17 0 28.5 11.5T600-840v40q0 17-11.5 28.5T560-760q-17 0-28.5-11.5Zm126 34Q640-755 640-780v-40q0-25 17.5-42.5T700-880q25 0 42.5 17.5T760-820v40q0 25-17.5 42.5T700-720q-25 0-42.5-17.5ZM400-480Z"/></svg>
    },
    {
      value: 'moderate',
      label: 'Moderate',
      desc: 'Balanced — responsive & protective',
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="M80-120v-80h360v-447q-26-9-45-28t-28-45H240l120 280q0 50-41 85t-99 35q-58 0-99-35t-41-85l120-280h-80v-80h247q12-35 43-57.5t70-22.5q39 0 70 22.5t43 57.5h247v80h-80l120 280q0 50-41 85t-99 35q-58 0-99-35t-41-85l120-280H593q-9 26-28 45t-45 28v447h360v80H80Zm585-320h150l-75-174-75 174Zm-520 0h150l-75-174-75 174Zm335-280q17 0 28.5-11.5T520-760q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760q0 17 11.5 28.5T480-720Z"/></svg>
    },
    {
      value: 'maximum',
      label: 'Maximum',
      desc: 'Cloud-like, long distance comfort',
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="M260-160q-91 0-155.5-63T40-377q0-78 47-139t123-78q25-92 100-149t170-57q117 0 198.5 81.5T760-520q69 8 114.5 59.5T920-340q0 75-52.5 127.5T740-160H260Zm0-80h480q42 0 71-29t29-71q0-42-29-71t-71-29h-60v-80q0-83-58.5-141.5T480-720q-83 0-141.5 58.5T280-520h-20q-58 0-99 41t-41 99q0 58 41 99t99 41Zm220-240Z"/></svg>
    },
    {
      value: 'unsure',
      label: 'Not Sure',
      desc: 'Recommend based on my other answers',
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="M424-320q0-81 14.5-116.5T500-514q41-36 62.5-62.5T584-637q0-41-27.5-68T480-732q-51 0-77.5 31T365-638l-103-44q21-64 77-111t141-47q105 0 161.5 58.5T698-641q0 50-21.5 85.5T609-475q-49 47-59.5 71.5T539-320H424Zm56 240q-33 0-56.5-23.5T400-160q0-33 23.5-56.5T480-240q33 0 56.5 23.5T560-160q0 33-23.5 56.5T480-80Z"/></svg>
    },
  ],
},
{
  id: 'budget',
  question: 'What is your budget?',
  sub: "We'll only show shoes in your range. All prices include VAT.",
  options: [
    {
      value: '0-1500',
      label: 'Under R1,500',
      desc: 'Great value options',
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="M200-200v-560 560Zm0 80q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v100h-80v-100H200v560h560v-100h80v100q0 33-23.5 56.5T760-120H200Zm320-160q-33 0-56.5-23.5T440-360v-240q0-33 23.5-56.5T520-680h280q33 0 56.5 23.5T880-600v240q0 33-23.5 56.5T800-280H520Zm280-80v-240H520v240h280Zm-117.5-77.5Q700-455 700-480t-17.5-42.5Q665-540 640-540t-42.5 17.5Q580-505 580-480t17.5 42.5Q615-420 640-420t42.5-17.5Z"/></svg>
    },
    {
      value: '1500-2500',
      label: 'R1,500 – R2,500',
      desc: 'Most popular range',
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="M880-720v480q0 33-23.5 56.5T800-160H160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720Zm-720 80h640v-80H160v80Zm0 160v240h640v-240H160Zm0 240v-480 480Z"/></svg>
    },
    {
      value: '2500-3500',
      label: 'R2,500 – R3,500',
      desc: 'Premium performance',
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="M480-120 80-600l120-240h560l120 240-400 480Zm-95-520h190l-60-120h-70l-60 120Zm55 347v-267H218l222 267Zm80 0 222-267H520v267Zm144-347h106l-60-120H604l60 120Zm-474 0h106l60-120H250l-60 120Z"/></svg>
    },
    {
      value: '3500+',
      label: 'R3,500+',
      desc: 'Elite, no compromises',
      icon: <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="currentColor"><path d="M200-160v-80h560v80H200Zm0-140-51-321q-2 0-4.5.5t-4.5.5q-25 0-42.5-17.5T80-680q0-25 17.5-42.5T140-740q25 0 42.5 17.5T200-680q0 7-1.5 13t-3.5 11l125 56 125-171q-11-8-18-21t-7-28q0-25 17.5-42.5T480-880q25 0 42.5 17.5T540-820q0 15-7 28t-18 21l125 171 125-56q-2-5-3.5-11t-1.5-13q0-25 17.5-42.5T820-740q25 0 42.5 17.5T880-680q0 25-17.5 42.5T820-620q-2 0-4.5-.5t-4.5-.5l-51 321H200Zm68-80h424l26-167-105 46-133-183-133 183-105-46 26 167Zm212 0Z"/></svg>
    },
  ],
},
]

export default function AIAdvisorPage() {
  const { products, loading } = useProducts()  // 👈 add this
  const [phase, setPhase] = useState('intro')   // intro | quiz | loading | results
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(null)
  const router = useRouter()

  const { user } = useAuth()
  const [aiRecommendations, setAiRecommendations] = useState([])

  const currentQ = QUESTIONS[qIndex]
  const progress = ((qIndex + 1) / QUESTIONS.length) * 100

  const handleAnswer = (val) => setSelected(val)

  const next = async () => {
    if (!selected) return
    const newAnswers = { ...answers, [currentQ.id]: selected }
    setAnswers(newAnswers)
    setSelected(null)
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex(i => i + 1)
    } else {
      setPhase('loading')
      try {
        // Save to running profile if logged in
        if (user) {
          const existingData = await getUserData(user.uid)
          await saveRunningProfile(user.uid, {
            training: newAnswers.training,
            arch: newAnswers.arch === 'neutral' ? 'Neutral' : newAnswers.arch === 'flat' ? 'Flat Feet' : newAnswers.arch === 'high' ? 'High Arch' : 'Neutral',
            terrain: newAnswers.terrain === 'road' ? 'Road' : newAnswers.terrain === 'trail' ? 'Trail' : newAnswers.terrain === 'treadmill' ? 'Treadmill' : 'Mixed',
            experience: newAnswers.experience,
            cushion: newAnswers.cushion,
            budget: newAnswers.budget,
            size: existingData?.runProfile?.size || 'UK 8',
          })
        }
        // Get AI recommendations
        const recs = await getAdvisorRecommendations(newAnswers, products)
        // Map AI results to full product objects
        const fullRecs = recs.map(rec => {
          const product = products.find(p => p.id === rec.id)
          return product ? { ...product, matchScore: rec.matchScore, matchReason: rec.matchReason, reasoning: rec.reasoning } : null
        }).filter(Boolean)
        setAiRecommendations(fullRecs)
        setPhase('results')
      } catch (err) {
        console.error(err)
        setPhase('results')
      }
    }
  }

  const back = () => {
    if (qIndex === 0) { setPhase('intro'); setSelected(null); return }
    setQIndex(i => i - 1)
    setSelected(answers[QUESTIONS[qIndex - 1].id] || null)
  }

  // Simple recommendation logic based on answers
  const getRecommendations = () => {
    const budget = answers.budget || '1500-2500'
    const [min, max] = budget === '3500+' ? [3500, 99999] : budget.split('-').map(Number)
    return products
      .filter(p => p.price >= min && (budget === '3500+' || p.price <= max))
      .slice(0, 3)
      .map((p, i) => ({ ...p, matchScore: 98 - i * 6, matchReason: i === 0 ? 'Best Match' : i === 1 ? 'Great Alternative' : 'Budget Pick' }))
  }

  const recommendations = phase === 'results' ? aiRecommendations : []
  // ── INTRO ──
  if (phase === 'intro') return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-h))', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 48px', position: 'relative', overflow: 'hidden' }}>

      {/* VIDEO BACKGROUND */}
      <video autoPlay muted loop playsInline
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}>
        <source
          src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/v1772367965/From_KlickPin_CF_Craft_Sportswear_US_on_Instagram_Turn_your_miles_2_smiles_Long-distance_running_is_more_than_just_a_sport_it_s_a_journey_of_self-discovery_and_resilience_w_Video_Video_Running_Running_photography_Long_distance_running_paurvx.mp4`}
          type="video/mp4"
        />    </video>

      {/* OVERLAY */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1 }} />

      {/* CONTENT */}
      <div style={{ maxWidth: 680, textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <div style={{ width: 80, height: 80, background: 'var(--accent)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
          <svg height="36" width="36" viewBox="0 0 16 16" style={{ color: 'white' }}>
            <path fillRule="evenodd" clipRule="evenodd" d="M8.75 2.79933C9.19835 2.53997 9.5 2.05521 9.5 1.5C9.5 0.671573 8.82843 0 8 0C7.17157 0 6.5 0.671573 6.5 1.5C6.5 2.05521 6.80165 2.53997 7.25 2.79933V5H7C4.027 5 1.55904 7.16229 1.08296 10H0V13H1V14.5V16H2.5H13.5H15V14.5V13H16V10H14.917C14.441 7.16229 11.973 5 9 5H8.75V2.79933ZM7 6.5C4.51472 6.5 2.5 8.51472 2.5 11V14.5H13.5V11C13.5 8.51472 11.4853 6.5 9 6.5H7ZM7.25 11.25C7.25 12.2165 6.4665 13 5.5 13C4.5335 13 3.75 12.2165 3.75 11.25C3.75 10.2835 4.5335 9.5 5.5 9.5C6.4665 9.5 7.25 10.2835 7.25 11.25ZM10.5 13C11.4665 13 12.25 12.2165 12.25 11.25C12.25 10.2835 11.4665 9.5 10.5 9.5C9.5335 9.5 8.75 10.2835 8.75 11.25C8.75 12.2165 9.5335 13 10.5 13Z" fill="currentColor" />
          </svg>
        </div>        <p style={{ fontFamily: 'DM Mono', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16 }}>AI-Powered</p>
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(48px,6vw,80px)', letterSpacing: 2, lineHeight: 0.95, marginBottom: 24, color: 'white' }}>YOUR PERSONAL<br />SHOE ADVISOR</h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontWeight: 300, maxWidth: 500, margin: '0 auto 48px' }}>
          Answer 6 quick questions about your foot type, running style, and goals. Our AI will recommend the perfect shoes for you — no running store visit needed.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 48 }}>
          {[['6 questions', 'Takes under 2 minutes'], ['AI matching', 'Based on your profile'], ['Free advice', 'No account needed']].map(([t, s]) => (
            <div key={t} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: 12, padding: '20px 16px', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: 'white' }}>{t}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{s}</div>
            </div>
          ))}
        </div>

        <button onClick={() => setPhase('quiz')}
          style={{ background: 'var(--accent)', color: 'white', border: 'none', padding: '18px 48px', borderRadius: 4, fontSize: 16, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.5px', transition: 'all 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Start Free Consultation →
        </button>
      </div>
    </div>
  )

  // ── QUIZ ──
  if (phase === 'quiz') return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-h))', padding: '60px 48px', maxWidth: 800, margin: '0 auto' }}>
      {/* Progress bar */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--mid)', fontFamily: 'DM Mono', marginBottom: 10 }}>
          <span>Question {qIndex + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 2, width: `${progress}%`, transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Question */}
      <div style={{ animation: 'fadeUp 0.4s ease both' }}>
        <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 40, letterSpacing: 1, marginBottom: 8 }}>{currentQ.question}</h2>
        <p style={{ color: 'var(--mid)', fontSize: 14, marginBottom: 36, fontWeight: 300 }}>{currentQ.sub}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
          {currentQ.options.map(opt => (
            <button key={opt.value} onClick={() => handleAnswer(opt.value)}
              style={{ padding: 24, border: `2px solid ${selected === opt.value ? 'var(--black)' : 'var(--border)'}`, borderRadius: 16, background: selected === opt.value ? '#f7f5f2' : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', transform: selected === opt.value ? 'scale(1.01)' : 'scale(1)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>{opt.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{opt.label}</div>
              <div style={{ fontSize: 13, color: 'var(--mid)', fontWeight: 300 }}>{opt.desc}</div>
              {selected === opt.value && <div style={{ marginTop: 12, fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1 }}>✓ Selected</div>}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={back} style={{ padding: '14px 24px', border: '2px solid var(--border)', borderRadius: 10, fontSize: 14, fontWeight: 600, background: 'white', cursor: 'pointer', color: 'var(--mid)' }}>
            ← Back
          </button>
          <button onClick={next} disabled={!selected}
            style={{ padding: '14px 40px', background: selected ? 'var(--black)' : 'var(--border)', color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: selected ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
            {qIndex < QUESTIONS.length - 1 ? 'Next Question →' : 'See My Recommendations →'}
          </button>
        </div>
      </div>
    </div>
  )

  // ── LOADING ──
  if (phase === 'loading') return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-h))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 }}>
      <div style={{ width: 72, height: 72, border: '4px solid var(--grey)', borderTop: '4px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <h2 style={{ fontFamily: 'Bebas Neue', fontSize: 32, letterSpacing: 2 }}>ANALYSING YOUR PROFILE</h2>
      <p style={{ color: 'var(--mid)', fontSize: 14 }}>Finding your perfect shoes...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  if (phase === 'results' && loading) return (
    <div style={{ minHeight: 'calc(100vh - var(--nav-h))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--mid)' }}>Loading recommendations...</p>
    </div>
  )

  // ── RESULTS ──
  return (
    <div style={{ padding: '60px 48px 80px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 48 }}>
        <p style={{ fontFamily: 'DM Mono', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>🤖 AI Recommendation</p>
        <h1 style={{ fontFamily: 'Bebas Neue', fontSize: 'clamp(48px,6vw,72px)', letterSpacing: 2, marginBottom: 16 }}>YOUR PERFECT MATCHES</h1>
        <p style={{ fontSize: 15, color: 'var(--mid)', fontWeight: 300, maxWidth: 560, lineHeight: 1.7 }}>Based on your profile, we found {recommendations.length} shoes that match your arch type, terrain, and budget.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>
        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {recommendations.map((product, i) => (
            <div key={product.id} style={{ background: 'white', border: `2px solid ${i === 0 ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 20, padding: 28, display: 'grid', gridTemplateColumns: '120px 1fr auto', gap: 24, alignItems: 'center', position: 'relative', overflow: 'hidden', transition: 'transform 0.2s,box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
            >
              {i === 0 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,var(--accent),var(--accent2))' }} />}
              <div style={{ width: 120, height: 120, background: 'var(--grey)', borderRadius: 16, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
                {product.images?.[0]
                  ? <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span>👟</span>
                }
              </div>              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'DM Mono', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, background: i === 0 ? 'var(--accent)' : 'var(--black)', color: 'white', padding: '3px 10px', borderRadius: 100 }}>{product.matchReason}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>{product.matchScore}% match</span>
                </div>
                <div style={{ fontFamily: 'DM Mono', fontSize: 10, color: 'var(--mid)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{product.brand}</div>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: 1, marginBottom: 8 }}>{product.name}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[product.arch, product.terrain, product.drop, product.weight].map(tag => (
                    <span key={tag} style={{ fontSize: 11, background: 'var(--grey)', padding: '3px 10px', borderRadius: 100, color: 'var(--mid)' }}>{tag}</span>
                  ))}
                </div>
                {product.reasoning && (
                  <div style={{ marginTop: 12, padding: '12px 14px', background: 'var(--grey)', borderRadius: 10, borderLeft: '3px solid var(--accent)' }}>
                    <p style={{ fontSize: 12, color: '#444', lineHeight: 1.7, margin: 0, fontWeight: 300 }}>{product.reasoning}</p>
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: 28, letterSpacing: 1 }}>{fmt(product.price)}</div>
                <button onClick={() => router.push(`/product/${product.id}`)}
                  style={{ padding: '12px 24px', background: i === 0 ? 'var(--black)' : 'white', color: i === 0 ? 'white' : 'var(--black)', border: `2px solid ${i === 0 ? 'var(--black)' : 'var(--border)'}`, borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'white' }}
                  onMouseLeave={e => { e.currentTarget.style.background = i === 0 ? 'var(--black)' : 'white'; e.currentTarget.style.borderColor = i === 0 ? 'var(--black)' : 'var(--border)'; e.currentTarget.style.color = i === 0 ? 'white' : 'var(--black)' }}
                >View Details →</button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar — Your Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 88 }}>
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--black)' }}>
              <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1, color: 'white' }}>YOUR PROFILE</h3>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {QUESTIONS.map(q => (
                <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--mid)', fontFamily: 'DM Mono', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{q.id}</span>
                  <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{answers[q.id] || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => { setPhase('intro'); setQIndex(0); setAnswers({}); setSelected(null) }}
            style={{ width: '100%', background: 'none', border: '2px solid var(--border)', borderRadius: 12, padding: 14, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--black)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >🔄 Retake Quiz</button>

          <a href="/products" style={{ display: 'block', textAlign: 'center', padding: 14, background: 'var(--grey)', borderRadius: 12, fontSize: 13, fontWeight: 600, color: 'var(--black)' }}>Browse All Shoes →</a>
        </div>
      </div>
    </div>
  )
}