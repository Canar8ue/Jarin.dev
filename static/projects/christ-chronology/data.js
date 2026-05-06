const timelineData = [
    {
        id: 1,
        date: "Pre-mortality",
        title: "Chosen from the Beginning",
        snippet: "In the Grand Council of Heaven, Jesus is chosen as the Savior of the world.",
        details: "Before the world was created, God the Father presented a plan for His children to gain a physical body and be tested. When a savior was needed to redeem mankind from sin and death, Jehovah (Jesus) humbly said, 'Here am I, send me,' and 'Father, thy will be done, and the glory be thine forever.'",
        scripture: "Abraham 3:27–28; Moses 4:1–2",
        image: "Images/1.webp"
    },
    {
        id: 2,
        date: "c. 4–6 BC",
        title: "The Nativity",
        snippet: "The Son of God is born in a stable in Bethlehem.",
        details: "Fulfilling ancient prophecy, Mary and Joseph traveled to Bethlehem for a tax decree. With no room in the inn, Mary gave birth to Jesus in a stable and laid him in a manger. Angels appeared to shepherds in nearby fields, proclaiming 'Glory to God in the highest, and on earth peace, good will toward men.'",
        scripture: "Luke 2:1–14",
        image: "Images/2.jpg"
    },
    {
        id: 3,
        date: "c. 8 AD",
        title: "About My Father's Business",
        snippet: "A twelve-year-old Jesus teaches the doctors in the temple.",
        details: "After the Feast of the Passover, Mary and Joseph realized Jesus was not with their caravan. They returned to Jerusalem and found him three days later in the temple, sitting in the midst of the doctors, both hearing them and asking them questions. He told his parents, 'Wist ye not that I must be about my Father's business?'",
        scripture: "Luke 2:41–49",
        image: "Images/3.jpg"
    },
    {
        id: 4,
        date: "c. 29 AD",
        title: "To Fulfill All Righteousness",
        snippet: "Jesus is baptized by John the Baptist in the River Jordan.",
        details: "Jesus traveled from Galilee to the Jordan River to be baptized by John. Though John felt unworthy, Jesus insisted it was necessary 'to fulfill all righteousness.' As Jesus came up out of the water, the heavens opened, the Spirit descended like a dove, and the Father’s voice declared, 'This is my beloved Son, in whom I am well pleased.'",
        scripture: "Matthew 3:13–17",
        image: "Images/4.jpg"
    },
    {
        id: 5,
        date: "c. 29 AD",
        title: "Water into Wine",
        snippet: "Jesus performs his first recorded public miracle at a wedding in Cana.",
        details: "At a wedding feast in Cana, the wine ran out. At the request of his mother, Mary, Jesus instructed the servants to fill six stone waterpots with water. When the ruler of the feast tasted it, the water had turned into high-quality wine, manifesting Jesus's glory and strengthening his disciples' faith.",
        scripture: "John 2:1–11",
        image: "Images/5.jpg"
    },
    {
        id: 6,
        date: "c. 30 AD",
        title: "The Higher Law",
        snippet: "Jesus delivers his most famous sermon, outlining the Beatitudes and the higher law.",
        details: "Seeing the multitudes, Jesus went up into a mountain and taught them. He gave the Beatitudes ('Blessed are the poor in spirit...') and taught that true righteousness goes beyond outward actions to the thoughts and intents of the heart. He commanded them to love their enemies and 'Be ye therefore perfect, even as your Father which is in heaven is perfect.'",
        scripture: "Matthew 5–7",
        image: "Images/6.webp"
    },
    {
        id: 7,
        date: "c. 32 AD",
        title: "The Bread of Life",
        snippet: "Jesus miraculously feeds a multitude with five loaves and two fish.",
        details: "A large crowd followed Jesus to a remote place. As evening approached, the disciples suggested sending the people away to buy food. Instead, Jesus took a young boy’s offering of five barley loaves and two small fish, blessed them, and fed 5,000 men (plus women and children), with twelve baskets of leftovers remaining.",
        scripture: "John 6:5–14",
        image: "Images/7.webp"
    },
    {
        id: 8,
        date: "c. 32 AD",
        title: "The Voice from the Cloud",
        snippet: "Jesus is transfigured before Peter, James, and John.",
        details: "Jesus took his three lead apostles up a high mountain. There, his face shone like the sun and his clothes became white as light. Moses and Elias (Elijah) appeared and conferred keys of priesthood authority. A bright cloud overshadowed them, and God the Father spoke again, saying, 'This is my beloved Son... hear ye him.'",
        scripture: "Matthew 17:1–9",
        image: "Images/8.webp"
    },
    {
        id: 9,
        date: "c. 32–33 AD",
        title: "I Am the Resurrection",
        snippet: "Jesus raises Lazarus from the dead after four days.",
        details: "Jesus arrived in Bethany four days after his friend Lazarus had died and been buried. Comforting Martha, he declared, 'I am the resurrection, and the life.' He went to the tomb, commanded the stone to be removed, and called out, 'Lazarus, come forth.' Lazarus walked out, bound in grave clothes, demonstrating Jesus's power over death.",
        scripture: "John 11:25–44",
        image: "Images/9.webp"
    },
    {
        id: 10,
        date: "c. 33 AD",
        title: "The Sacrament",
        snippet: "Jesus institutes the sacrament during the Passover meal.",
        details: "In the upper room, Jesus washed the feet of his disciples as an example of service. During the meal, he took bread and wine, blessed them, and gave them to his disciples, asking them to eat and drink in remembrance of his body and blood, which would be shed for them. He commanded them to 'this do in remembrance of me.'",
        scripture: "Luke 22:14–20",
        image: "Images/10.webp"
    },
    {
        id: 11,
        date: "c. 33 AD",
        title: "The Atonement",
        snippet: "Jesus suffers for the sins of the world in the Garden of Gethsemane.",
        details: "Jesus went to the garden to pray, 'Father, if thou be willing, remove this cup from me: nevertheless not my will, but thine, be done.' Being in agony, he prayed more earnestly, and his sweat was as it were great drops of blood falling down to the ground. Here, he took upon himself the sins, pains, and sicknesses of all mankind.",
        scripture: "Luke 22:39–44; Mosiah 3:7",
        image: "Images/11.webp"
    },
    {
        id: 12,
        date: "c. 33 AD",
        title: "It Is Finished",
        snippet: "Jesus is crucified on Calvary and dies for the world.",
        details: "After being betrayed, tried, and scourged, Jesus was led to Golgotha. He was nailed to the cross between two thieves. Even in his suffering, he prayed for his executioners, 'Father, forgive them; for they know not what they do.' After hours of darkness, he cried out with a loud voice, 'Father, into thy hands I commend my spirit,' and died.",
        scripture: "Luke 23:33–46",
        image: "Images/12.webp"
    },
    {
        id: 13,
        date: "c. 33 AD",
        title: "He Is Risen",
        snippet: "Jesus rises from the dead on the third day, conquering the grave.",
        details: "Early on the first day of the week, Mary Magdalene and other women went to the tomb and found the stone rolled away. An angel told them, 'He is not here; for he is risen, as he said.' Jesus later appeared to Mary Magdalene near the tomb, and then to his disciples, showing them the wounds in his hands and feet to prove he had a tangible, resurrected body.",
        scripture: "Matthew 28:1–10; Luke 24:36–39",
        image: "Images/13.webp"
    },
    {
        id: 14,
        date: "c. 33 AD",
        title: "The Great Commission",
        snippet: "Jesus ascends into heaven after instructing his apostles.",
        details: "For forty days after his resurrection, Jesus ministered to his disciples. He commanded them to go and teach all nations, baptizing them in the name of the Father, Son, and Holy Ghost. He then led them out as far as Bethany, lifted his hands to bless them, and was carried up into heaven as a cloud received him out of their sight.",
        scripture: "Acts 1:9–11",
        image: "Images/14.webp"
    },
    {
        id: 15,
        date: "c. 34 AD",
        title: "The Other Sheep",
        snippet: "The resurrected Jesus descends from heaven to visit the Nephites in the Americas.",
        details: "Following great destruction and darkness in the Americas (signifying his death), a multitude gathered at the temple in Bountiful. They heard a quiet, piercing voice from heaven three times, introducing the Son. They saw a Man descending in a white robe. He stood in their midst and said, 'Behold, I am Jesus Christ, whom the prophets testified shall come into the world.' He invited them to thrust their hands into his side and feel the prints of the nails, that they might know he was the God of Israel and the God of the whole earth.",
        scripture: "3 Nephi 11:1–17",
        image: "Images/15.webp"
    }
];