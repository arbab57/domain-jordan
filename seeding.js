const { json } = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const Photo = require("./models/photoSchema");
const Property = require("./models/propertySchema");
const Blog = require("./models/blogSchema");
const Booking = require("./models/bookingSchema");

mongoose.connect("mongodb://localhost:27017/domain-jordan", {});

// const upurl = `https://api.unsplash.com/search/photos?page=3&per_page=30&query=game&client_id=FmWVzU9t_ZbztGOiq5DU0tJYIzTFV_YJpo-OsGFygbo`

// const getImages = async () => {
//     const images = await fetch(upurl)
//     const res = await images.json()
//     console.log(res.results.length)
//     const urls = res.results.map((image) => {
//     return {
//       slug: image.slug,
//       urls: image.urls,
//     }
//     })
//     fs.writeFileSync("images.json", JSON.stringify(urls))
// }
// getImages()

const bookings = [
  {
    name: "John Doe",
    email: "john@example.com",
    phone: 1234567890,
    propertyName: "Beachside Villa",
    checkInDate: new Date("2024-09-20"),
    checkOutDate: new Date("2024-09-25"),
    numberOfGuests: 4,
    bookingStatus: "Confirmed",
    paymentStatus: "Paid",
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    phone: 1234567891,
    propertyName: "Mountain Cabin",
    checkInDate: new Date("2024-10-01"),
    checkOutDate: new Date("2024-10-05"),
    numberOfGuests: 2,
    bookingStatus: "Pending",
    paymentStatus: "Unpaid",

  },
  {
    name: "Robert Brown",
    email: "robert@example.com",
    phone: 1234567892,
    propertyName: "City Apartment",
    checkInDate: new Date("2024-11-10"),
    checkOutDate: new Date("2024-11-12"),
    numberOfGuests: 1,
    bookingStatus: "Cancelled",
    paymentStatus: "Unpaid",

  },
  {
    name: "Emily Davis",
    email: "emily@example.com",
    phone: 1234567893,
    propertyName: "Seaside Cottage",
    checkInDate: new Date("2024-12-15"),
    checkOutDate: new Date("2024-12-20"),
    numberOfGuests: 3,
    bookingStatus: "Confirmed",
    paymentStatus: "Paid",

  },
  {
    name: "Michael Johnson",
    email: "michael@example.com",
    phone: 1234567894,
    propertyName: "Luxury Penthouse",
    checkInDate: new Date("2024-09-01"),
    checkOutDate: new Date("2024-09-03"),
    numberOfGuests: 2,
    bookingStatus: "Confirmed",
    paymentStatus: "Paid",

  },
  {
    name: "Linda White",
    email: "linda@example.com",
    phone: 1234567895,
    propertyName: "Forest Lodge",
    checkInDate: new Date("2024-11-20"),
    checkOutDate: new Date("2024-11-22"),
    numberOfGuests: 5,
    bookingStatus: "Pending",
    paymentStatus: "Unpaid",

  },
  {
    name: "David Green",
    email: "david@example.com",
    phone: 1234567896,
    propertyName: "Riverfront Cabin",
    checkInDate: new Date("2024-10-15"),
    checkOutDate: new Date("2024-10-18"),
    numberOfGuests: 4,
    bookingStatus: "Cancelled",
    paymentStatus: "Unpaid",

  },
  {
    name: "Sophia Lee",
    email: "sophia@example.com",
    phone: 1234567897,
    propertyName: "Downtown Loft",
    checkInDate: new Date("2024-08-20"),
    checkOutDate: new Date("2024-08-25"),
    numberOfGuests: 2,
    bookingStatus: "Confirmed",
    paymentStatus: "Paid",

  },
  {
    name: "James Walker",
    email: "james@example.com",
    phone: 1234567898,
    propertyName: "Lake House",
    checkInDate: new Date("2024-07-05"),
    checkOutDate: new Date("2024-07-10"),
    numberOfGuests: 6,
    bookingStatus: "Pending",
    paymentStatus: "Unpaid",

  },
  {
    name: "Olivia Harris",
    email: "olivia@example.com",
    phone: 1234567899,
    propertyName: "Ski Chalet",
    checkInDate: new Date("2024-12-01"),
    checkOutDate: new Date("2024-12-05"),
    numberOfGuests: 3,
    bookingStatus: "Confirmed",
    paymentStatus: "Paid",

  },
];

function genRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const randomText = (tex, min, max) => {
  const start = genRandom(0, tex.length);
  const end = start + genRandom(min, max);
  return tex.slice(start, end);
};

const genRandomArray = (arr, min, max) => {
  let array = [];
  const limit = genRandom(min, max);
  for (let i = 1; i < limit; i++) {
    const num = genRandom(0, arr.length - 1);
    array.push(arr[num]);
  }
  return [...new Set(array)];
};

const names = [
  "Eagle Crest",
  "Laurel",
  "Stephen",
  "Fordem",
  "Duke",
  "Havey",
  "Farmco",
  "Bayside",
  "Corben",
  "Vermont",
  "Ridgeway",
  "Fallview",
  "Lotheville",
  "Express",
  "Gale",
  "Florence",
  "Melvin",
  "Myrtle",
  "Vahlen",
  "Donald",
  "Meadow Valley",
  "Westend",
  "Claremont",
  "Stone Corner",
  "Cherokee",
];

const reviews = [
  {
    rating: 5,
    review:
      "An exceptional course with clear explanations and practical exercises. It exceeded my expectations.",
  },
  {
    rating: 4,
    review:
      "Well-structured and informative. Some areas could use more depth, but overall a great learning experience.",
  },
  {
    rating: 5,
    review:
      "The best course I've taken! The instructor's expertise and the detailed content made complex topics easy to understand.",
  },
  {
    rating: 3,
    review:
      "The course was decent but lacked engagement. More interactive elements would enhance the learning experience.",
  },
  {
    rating: 4,
    review:
      "A solid course that provides a good foundation. The real-world examples were especially helpful.",
  },
  {
    rating: 5,
    review:
      "Highly recommended! The course material was well-organized and the instructor was very knowledgeable.",
  },
  {
    rating: 4,
    review:
      "The course covered a lot of material, but a few topics could have been explained in more detail.",
  },
  {
    rating: 5,
    review:
      "Fantastic course! The hands-on projects and quizzes really helped reinforce the concepts learned.",
  },
  {
    rating: 3,
    review:
      "Useful content, but the course could benefit from a faster pace and more engaging delivery.",
  },
  {
    rating: 4,
    review:
      "Good course overall. The instructor was clear and concise, though some areas felt a bit rushed.",
  },
  {
    rating: 5,
    review:
      "Incredible course with practical insights and clear instruction. I learned a lot and feel confident in the subject.",
  },
  {
    rating: 4,
    review:
      "Very informative with practical examples. A few more advanced topics would be a great addition.",
  },
  {
    rating: 5,
    review:
      "Excellent course! The material was well-organized and the instructor provided valuable feedback.",
  },
  {
    rating: 3,
    review:
      "The course was okay but lacked depth in some areas. More detailed explanations would be helpful.",
  },
  {
    rating: 4,
    review:
      "Great course with a lot of valuable information. The pacing was good, but some sections could use more examples.",
  },
  {
    rating: 5,
    review:
      "One of the best courses I've taken. The content was relevant and the teaching style was engaging.",
  },
  {
    rating: 4,
    review:
      "Good course with clear explanations. Additional interactive elements would improve the overall experience.",
  },
  {
    rating: 5,
    review:
      "Outstanding course! The practical projects were very helpful in applying the concepts learned.",
  },
  {
    rating: 3,
    review:
      "The course was useful but needed more detailed explanations and examples for better understanding.",
  },
  {
    rating: 4,
    review:
      "A comprehensive course with useful content. The instructor was knowledgeable, though some topics were a bit brief.",
  },
  {
    rating: 5,
    review:
      "Excellent course! The content was well-structured and the instructor's expertise was evident.",
  },
  {
    rating: 4,
    review:
      "Very good course. The material was relevant, but a few sections could have been more engaging.",
  },
  {
    rating: 5,
    review:
      "An exceptional learning experience! The course was well-organized and provided in-depth knowledge on the topic.",
  },
  {
    rating: 3,
    review:
      "The course was adequate but lacked interactive components. More hands-on activities would be beneficial.",
  },
  {
    rating: 4,
    review:
      "Good course with practical examples. The pacing was generally good, though some sections felt a bit slow.",
  },
  {
    rating: 5,
    review:
      "Fantastic course! The instructor was engaging, and the content was highly relevant and useful.",
  },
  {
    rating: 4,
    review:
      "Great course overall. Some topics were covered in more detail than others, but it was very informative.",
  },
  {
    rating: 5,
    review:
      "Highly recommend this course! The clear explanations and practical exercises made learning enjoyable.",
  },
  {
    rating: 3,
    review:
      "The course provided useful information but lacked depth in certain areas. More detailed content would be helpful.",
  },
  {
    rating: 4,
    review:
      "A solid course with good content. The pace was good, but a few more interactive elements would enhance learning.",
  },
  {
    rating: 5,
    review:
      "Incredible course with detailed content and practical applications. The instructor did an excellent job.",
  },
  {
    rating: 4,
    review:
      "Very good course with useful material. A few more examples and hands-on activities would improve it further.",
  },
  {
    rating: 5,
    review:
      "Exceptional course! The instructor was knowledgeable, and the content was well-organized and relevant.",
  },
  {
    rating: 3,
    review:
      "The course was helpful but needed more engaging content and practical examples to reinforce learning.",
  },
  {
    rating: 4,
    review:
      "Great course with practical insights. The material was well-presented, though some topics could be more detailed.",
  },
  {
    rating: 5,
    review:
      "Excellent course! The content was clear, and the projects were highly beneficial for applying what was learned.",
  },
  {
    rating: 4,
    review:
      "A good course overall. The material was useful, but a few more interactive elements would enhance the experience.",
  },
  {
    rating: 5,
    review:
      "Highly recommended! The course was well-organized, and the instructor's teaching style was very effective.",
  },
  {
    rating: 3,
    review:
      "The course covered basic concepts but lacked depth in some areas. More detailed content would be useful.",
  },
  {
    rating: 4,
    review:
      "Good course with relevant information. The pace was steady, though some sections could be more engaging.",
  },
  {
    rating: 5,
    review:
      "Fantastic learning experience! The course was well-structured, and the practical exercises were very helpful.",
  },
  {
    rating: 4,
    review:
      "Very informative course. The material was relevant, though some sections felt a bit rushed.",
  },
  {
    rating: 5,
    review:
      "An outstanding course with clear explanations and practical applications. I feel much more confident in the subject.",
  },
  {
    rating: 3,
    review:
      "The course was decent but could benefit from more interactive content and practical examples.",
  },
  {
    rating: 4,
    review:
      "Good course with useful material. A few more examples and hands-on activities would make it even better.",
  },
  {
    rating: 5,
    review:
      "Excellent course! The content was detailed, and the instructor provided valuable feedback throughout.",
  },
  {
    rating: 4,
    review:
      "Great course overall. The material was useful, but a few more interactive elements would enhance the experience.",
  },
  {
    rating: 5,
    review:
      "Highly recommend this course! The instructor was engaging, and the content was relevant and practical.",
  },
  {
    rating: 3,
    review:
      "The course provided basic information but lacked depth in certain areas. More detailed content would be beneficial.",
  },
  {
    rating: 4,
    review:
      "A solid course with practical insights. The pacing was good, though some sections could use more detail.",
  },
  {
    rating: 5,
    review:
      "Fantastic course with clear instruction and valuable content. The practical projects were especially helpful.",
  },
  {
    rating: 4,
    review:
      "Good course with useful material. The instructor was knowledgeable, but a few more examples would improve it.",
  },
  {
    rating: 5,
    review:
      "Exceptional learning experience! The course was well-organized, and the content was highly relevant.",
  },
  {
    rating: 3,
    review:
      "The course was okay but needed more interactive elements and detailed explanations for better understanding.",
  },
  {
    rating: 4,
    review:
      "Great course with practical examples. The content was useful, though a few more advanced topics would be helpful.",
  },
  {
    rating: 5,
    review:
      "Highly recommend this course! The instructor's expertise and the well-structured content made learning enjoyable.",
  },
  {
    rating: 4,
    review:
      "A good course overall. The material was useful, but some sections felt a bit rushed and could use more detail.",
  },
];

const bedding = ["Premium", "Standard", "Deluxe"];
const bool = [true, false];
const category = ["Standard", "Deluxe", "Suite", "Room", "Apartment"];

const text =
  'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32 It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using Content here, content here, making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for lorem ipsum will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like). There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which dont look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isnt anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc.';

const images = [
  "https://images.unsplash.com/photo-1448630360428-65456885c650?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxfHxwcm9wZXJ0eXxlbnwwfHx8fDE3MjYyOTQyMzh8MA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyfHxwcm9wZXJ0eXxlbnwwfHx8fDE3MjYyOTQyMzh8MA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwzfHxwcm9wZXJ0eXxlbnwwfHx8fDE3MjYyOTQyMzh8MA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1498373419901-52eba931dc4f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw0fHxwcm9wZXJ0eXxlbnwwfHx8fDE3MjYyOTQyMzh8MA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1522050212171-61b01dd24579?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw1fHxwcm9wZXJ0eXxlbnwwfHx8fDE3MjYyOTQyMzh8MA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1524292691042-82ed9c62673b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw2fHxwcm9wZXJ0eXxlbnwwfHx8fDE3MjYyOTQyMzh8MA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1469565686301-a0cf06bacf92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw3fHxwcm9wZXJ0eXxlbnwwfHx8fDE3MjYyOTQyMzh8MA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1483097365279-e8acd3bf9f18?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw4fHxwcm9wZXJ0eXxlbnwwfHx8fDE3MjYyOTQyMzh8MA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1533211428219-ad43d21f69cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw5fHxwcm9wZXJ0eXxlbnwwfHx8fDE3MjYyOTQyMzh8MA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1529316738131-4d0e0761a38e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMHx8cHJvcGVydHl8ZW58MHx8fHwxNzI2Mjk0MjM4fDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1472224371017-08207f84aaae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw1MXx8cHJvcGVydHl8ZW58MHx8fHwxNzI2Mjk0NTEyfDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw1Mnx8cHJvcGVydHl8ZW58MHx8fHwxNzI2Mjk0NTEyfDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw1M3x8cHJvcGVydHl8ZW58MHx8fHwxNzI2Mjk0NTEyfDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1502005097973-6a7082348e28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw1NHx8cHJvcGVydHl8ZW58MHx8fHwxNzI2Mjk0NTEyfDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw1NXx8cHJvcGVydHl8ZW58MHx8fHwxNzI2Mjk0NTEyfDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1523217582562-09d0def993a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw1Nnx8cHJvcGVydHl8ZW58MHx8fHwxNzI2Mjk0NTEyfDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1542539629-9c411af3367c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw1N3x8cHJvcGVydHl8ZW58MHx8fHwxNzI2Mjk0NTEyfDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1696491917387-62a7895af261?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw1OHx8cHJvcGVydHl8ZW58MHx8fHwxNzI2Mjk0NTEyfDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1597799029342-ab2546a93ec6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw1OXx8cHJvcGVydHl8ZW58MHx8fHwxNzI2Mjk0NTEyfDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1669669255713-c6745d7ba11d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw2MHx8cHJvcGVydHl8ZW58MHx8fHwxNzI2Mjk0NTEyfDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1581332480167-d5d4b97588f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMDF8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU0OXww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1719752585472-ddc1cc7edbf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMDJ8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU0OXww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1489476518696-1d12316c4c81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMDN8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU0OXww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1715320555580-521db1a426e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMDR8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU0OXww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1586278553992-34be78c7401f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMDV8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU0OXww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1585144287397-955b82ba2ab3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMDZ8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU0OXww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1711991812224-78eab2a3ee0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMDd8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU0OXww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1587409968566-368e01ae992d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMDh8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU0OXww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1699704736732-b47dc24bd1bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMDl8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU0OXww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1685414620457-14d1403fc85e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMTB8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU0OXww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1697872414987-394c18461671?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxNTF8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU1N3ww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1581332480152-ca16ee29b7b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxNTJ8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU1N3ww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1608249529607-4accdb2b003f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxNTN8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU1N3ww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1602941525436-839a5be074ff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxNTR8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU1N3ww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1679939153963-ff44f5deeba2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxNTV8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU1N3ww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1702971274208-3ddc0ed49936?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxNTZ8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU1N3ww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1717479244031-7c353c4b5204?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxNTd8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU1N3ww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1470290032981-3371c20736f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxNTh8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU1N3ww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1582647509836-d7a7c611ce50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxNTl8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU1N3ww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1613845482849-d063a0862792?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxNjB8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU1N3ww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1658280024253-34cafdfbb002?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyMDF8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU2Nnww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1664091919379-9769001a1e93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyMDJ8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU2Nnww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1674746760908-461a3f97175d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyMDN8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU2Nnww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1713514022505-fb1f65d476a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyMDR8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU2Nnww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1622223373286-4db475b3b9a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyMDV8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU2Nnww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1634335935807-2a814d7267a3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyMDZ8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU2Nnww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1630060041646-3ba002aa7d37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyMDd8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU2Nnww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1714461203961-e7d13a1201a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyMDh8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU2Nnww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1724482606633-fa74fe4f5de1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyMDl8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU2Nnww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1631821938164-9383abac340c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyMTB8fHByb3BlcnR5fGVufDB8fHx8MTcyNjI5NDU2Nnww&ixlib=rb-4.0.3&q=80&w=1080",
];

const blogImages = [
  "https://images.unsplash.com/photo-1512279093314-5926a353720c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyMDF8fGJsb2d8ZW58MHx8fHwxNzI2Mjk1ODg4fDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1513128034602-7814ccaddd4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyMDJ8fGJsb2d8ZW58MHx8fHwxNzI2Mjk1ODg4fDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1459257831348-f0cdd359235f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyMDN8fGJsb2d8ZW58MHx8fHwxNzI2Mjk1ODg4fDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1499244571948-7ccddb3583f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyMDR8fGJsb2d8ZW58MHx8fHwxNzI2Mjk1ODg4fDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1472289065668-ce650ac443d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyMDV8fGJsb2d8ZW58MHx8fHwxNzI2Mjk1ODg4fDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1488998427799-e3362cec87c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyMDZ8fGJsb2d8ZW58MHx8fHwxNzI2Mjk1ODg4fDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1497005367839-6e852de72767?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyMDd8fGJsb2d8ZW58MHx8fHwxNzI2Mjk1ODg4fDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1545239351-ef35f43d514b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyMDh8fGJsb2d8ZW58MHx8fHwxNzI2Mjk1ODg4fDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1518226203301-8e7f833c6a94?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyMDl8fGJsb2d8ZW58MHx8fHwxNzI2Mjk1ODg4fDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyMTB8fGJsb2d8ZW58MHx8fHwxNzI2Mjk1ODg4fDA&ixlib=rb-4.0.3&q=80&w=1080",

  "https://images.unsplash.com/photo-1505330622279-bf7d7fc918f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxfHxibG9nfGVufDB8fHx8MTcyNjI5NTkwM3ww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1499750310107-5fef28a66643?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwyfHxibG9nfGVufDB8fHx8MTcyNjI5NTkwM3ww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1488751045188-3c55bbf9a3fa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwzfHxibG9nfGVufDB8fHx8MTcyNjI5NTkwM3ww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1491975474562-1f4e30bc9468?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw0fHxibG9nfGVufDB8fHx8MTcyNjI5NTkwM3ww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw1fHxibG9nfGVufDB8fHx8MTcyNjI5NTkwM3ww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1496449903678-68ddcb189a24?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw2fHxibG9nfGVufDB8fHx8MTcyNjI5NTkwM3ww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1455849318743-b2233052fcff?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw3fHxibG9nfGVufDB8fHx8MTcyNjI5NTkwM3ww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw4fHxibG9nfGVufDB8fHx8MTcyNjI5NTkwM3ww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1542435503-956c469947f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw5fHxibG9nfGVufDB8fHx8MTcyNjI5NTkwM3ww&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/reserve/LJIZlzHgQ7WPSh5KVTCB_Typewriter.jpg?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMHx8YmxvZ3xlbnwwfHx8fDE3MjYyOTU5MDN8MA&ixlib=rb-4.0.3&q=80&w=1080",

  "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw1MXx8YmxvZ3xlbnwwfHx8fDE3MjYyOTU5MTJ8MA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw1Mnx8YmxvZ3xlbnwwfHx8fDE3MjYyOTU5MTJ8MA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1501504905252-473c47e087f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw1M3x8YmxvZ3xlbnwwfHx8fDE3MjYyOTU5MTJ8MA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1499728603263-13726abce5fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw1NHx8YmxvZ3xlbnwwfHx8fDE3MjYyOTU5MTJ8MA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1504805572947-34fad45aed93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw1NXx8YmxvZ3xlbnwwfHx8fDE3MjYyOTU5MTJ8MA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1514782831304-632d84503f6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw1Nnx8YmxvZ3xlbnwwfHx8fDE3MjYyOTU5MTJ8MA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/uploads/141103282695035fa1380/95cdfeef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw1N3x8YmxvZ3xlbnwwfHx8fDE3MjYyOTU5MTJ8MA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1526280760714-f9e8b26f318f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw1OHx8YmxvZ3xlbnwwfHx8fDE3MjYyOTU5MTJ8MA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1518665750801-883c188a660d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw1OXx8YmxvZ3xlbnwwfHx8fDE3MjYyOTU5MTJ8MA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1483058712412-4245e9b90334?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHw2MHx8YmxvZ3xlbnwwfHx8fDE3MjYyOTU5MTJ8MA&ixlib=rb-4.0.3&q=80&w=1080",

  "https://images.unsplash.com/photo-1489110804417-276c3f517515?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMDF8fGJsb2d8ZW58MHx8fHwxNzI2Mjk1OTI1fDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMDJ8fGJsb2d8ZW58MHx8fHwxNzI2Mjk1OTI1fDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1493723843671-1d655e66ac1c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMDN8fGJsb2d8ZW58MHx8fHwxNzI2Mjk1OTI1fDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMDR8fGJsb2d8ZW58MHx8fHwxNzI2Mjk1OTI1fDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1484981138541-3d074aa97716?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMDV8fGJsb2d8ZW58MHx8fHwxNzI2Mjk1OTI1fDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1502139214982-d0ad755818d8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMDZ8fGJsb2d8ZW58MHx8fHwxNzI2Mjk1OTI1fDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMDd8fGJsb2d8ZW58MHx8fHwxNzI2Mjk1OTI1fDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMDh8fGJsb2d8ZW58MHx8fHwxNzI2Mjk1OTI1fDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMDl8fGJsb2d8ZW58MHx8fHwxNzI2Mjk1OTI1fDA&ixlib=rb-4.0.3&q=80&w=1080",
  "https://images.unsplash.com/photo-1495001258031-d1b407bc1776?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w2MjYzNzB8MHwxfHNlYXJjaHwxMTB8fGJsb2d8ZW58MHx8fHwxNzI2Mjk1OTI1fDA&ixlib=rb-4.0.3&q=80&w=1080",
];

const tags = [
  "new",
  "good",
  "tech",
  "property",
  "house",
  "market",
  "today",
  "good",
  "node",
  "gold",
  "cheap",
  "blog",
  "test",
];

const seed = async () => {
  try {
    await Photo.deleteMany({});
    for (const image of images) {
      const photo = new Photo({ title: "property", url: image });
      await photo.save();
    }

    const photos = await Photo.find({ title: "property" });

    await Property.deleteMany({});
    for (let i = 1; i < 25; i++) {
      const property = new Property({
        name: names[genRandom(0, names.length - 1)],
        maxOccupancy: genRandom(4, 16),
        surfaceArea: genRandom(16, 46),
        bedding: bedding[genRandom(0, bedding.length - 1)],
        airCon: bool[genRandom(0, bool.length - 1)],
        price: genRandom(75, 600),
        availabile: bool[genRandom(0, bool.length - 1)],
        category: category[genRandom(0, category.length - 1)],
        description: randomText(text, 150, text.length),
        featuredImage: photos[i - 1],
        photos: genRandomArray(photos, 3, 16),
        metaTitle: randomText(text, 50, 150),
        metaDescription: randomText(text, 50, 150),
        metaTags: genRandomArray(tags, 2, 8),
      });
      await property.save();
    }

    for (const image of blogImages) {
      const photo = new Photo({ title: "blog", url: image });
      await photo.save();
    }
    const blogPhotos = await Photo.find({ title: "blog" });

    await Blog.deleteMany({});
    for (let i = 1; i < 18; i++) {
      const blog = new Blog({
        title: randomText(text, 50, 120),
        content: randomText(text, 200, text.length),
        author: randomText(text, 7, 45),
        image: blogPhotos[i - 1],
        publishDate: Date.now() + genRandom(2, 16) * 86400000,
        tags: genRandomArray(tags, 2, 8),
        excrept: randomText(text, 120, 220),
        metaTitle: randomText(text, 50, 150),
        metaDescription: randomText(text, 50, 150),
        metaTags: genRandomArray(tags, 2, 8),
      });
      await blog.save();
    }

    const propertyIds = await Property.find();
    await Booking.deleteMany({});
    await Booking.insertMany(bookings);

    console.log("Database Seeded");
  } catch (error) {
    console.log(error);
  }
};

seed();
