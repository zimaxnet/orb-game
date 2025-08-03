import { MongoClient } from 'mongodb';

class BlobStorageImageService {
    constructor() {
        this.mongoClient = null;
        this.db = null;
        this.collection = null;
        this.imageDatabase = {
            // Real images uploaded to blob storage
            figures: {
                "Archimedes": {
                    name: "Archimedes",
                    category: "Technology",
                    epoch: "Ancient",
                    images: {
                        portraits: [],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Archimedes_achievements_6e5edf68.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Archimedes_inventions_6e5edf68.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Archimedes_artifacts_79080eea.jpg",
                        ],
                    }
                },
                "Imhotep": {
                    name: "Imhotep",
                    category: "Technology",
                    epoch: "Ancient",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Imhotep_portraits_491c0889.jpg",
                        ],
                        achievements: [],
                        inventions: [],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Imhotep_artifacts_dfd2e934.jpg",
                        ],
                    }
                },
                "Hero of Alexandria": {
                    name: "Hero of Alexandria",
                    category: "Technology",
                    epoch: "Ancient",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hero_of_Alexandria_portraits_5cc101e0.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hero_of_Alexandria_achievements_7ff854f8.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hero_of_Alexandria_inventions_7ff854f8.jpg",
                        ],
                        artifacts: [],
                    }
                },
                "Al-Jazari": {
                    name: "Al-Jazari",
                    category: "Technology",
                    epoch: "Medieval",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Al_Jazari_portraits_cc51b6e4.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Al_Jazari_inventions_789d38a8.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Al_Jazari_inventions_cc51b6e4.jpg",
                        ],
                        artifacts: [],
                    }
                },
                "Johannes Gutenberg": {
                    name: "Johannes Gutenberg",
                    category: "Technology",
                    epoch: "Medieval",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Johannes_Gutenberg_portraits_117eed4f.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Johannes_Gutenberg_inventions_f2150c79.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Johannes_Gutenberg_inventions_f2150c79.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Johannes_Gutenberg_artifacts_117eed4f.jpg",
                        ],
                    }
                },
                "Li Shizhen": {
                    name: "Li Shizhen",
                    category: "Technology",
                    epoch: "Medieval",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Li_Shizhen_portraits_ae453339.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Li_Shizhen_inventions_ae453339.jpg",
                        ],
                        artifacts: [],
                    }
                },
                "James Watt": {
                    name: "James Watt",
                    category: "Technology",
                    epoch: "Industrial",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/James_Watt_portraits_b043fd63.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/James_Watt_achievements_6c12bfea.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/James_Watt_inventions_0bcb9454.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/James_Watt_artifacts_5051c11f.jpg",
                        ],
                    }
                },
                "Charles Babbage": {
                    name: "Charles Babbage",
                    category: "Technology",
                    epoch: "Industrial",
                    images: {
                        portraits: [],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Charles_Babbage_achievements_79dd506a.jpg",
                        ],
                        inventions: [],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Charles_Babbage_artifacts_0fbd6289.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Charles_Babbage_artifacts_79dd506a.jpg",
                        ],
                    }
                },
                "Samuel Morse": {
                    name: "Samuel Morse",
                    category: "Technology",
                    epoch: "Industrial",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Samuel_Morse_portraits_198770e1.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Samuel_Morse_portraits_4602b617.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Samuel_Morse_achievements_fb2bbc9a.png",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Samuel_Morse_inventions_0c1794e8.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Samuel_Morse_inventions_0c1794e8.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Samuel_Morse_artifacts_fb2bbc9a.png",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Samuel_Morse_artifacts_0c1794e8.jpg",
                        ],
                    }
                },
                "Tim Berners-Lee": {
                    name: "Tim Berners-Lee",
                    category: "Technology",
                    epoch: "Modern",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Tim_Berners_Lee_portraits_1f5b30bf.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Tim_Berners_Lee_achievements_538ab62a.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Tim_Berners_Lee_inventions_538ab62a.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Tim_Berners_Lee_inventions_538ab62a.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Tim_Berners_Lee_artifacts_538ab62a.jpg",
                        ],
                    }
                },
                "Steve Jobs": {
                    name: "Steve Jobs",
                    category: "Technology",
                    epoch: "Modern",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Steve_Jobs_portraits_8215961f.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Steve_Jobs_portraits_4cf554e2.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Steve_Jobs_achievements_410b9425.jpeg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Steve_Jobs_achievements_e64f5604.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Steve_Jobs_inventions_410b9425.jpeg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Steve_Jobs_inventions_dc338e74.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Steve_Jobs_artifacts_8215961f.jpg",
                        ],
                    }
                },
                "Hedy Lamarr": {
                    name: "Hedy Lamarr",
                    category: "Technology",
                    epoch: "Modern",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hedy_Lamarr_portraits_a63c0300.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hedy_Lamarr_achievements_666cdeda.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hedy_Lamarr_inventions_a39b410d.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hedy_Lamarr_inventions_a63c0300.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hedy_Lamarr_artifacts_3717fa13.jpg",
                        ],
                    }
                },
                "Fei-Fei Li": {
                    name: "Fei-Fei Li",
                    category: "Technology",
                    epoch: "Future",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Fei_Fei_Li_portraits_753ba319.jpg",
                        ],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Elon Musk": {
                    name: "Elon Musk",
                    category: "Technology",
                    epoch: "Future",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Elon_Musk_portraits_f63a6c8c.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Elon_Musk_portraits_bdf360a4.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Elon_Musk_achievements_e1f7d82b.png",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Elon_Musk_achievements_a6b44f2f.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Elon_Musk_inventions_990d81a7.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Elon_Musk_artifacts_f9d8a840.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Elon_Musk_artifacts_458dbfb6.jpg",
                        ],
                    }
                },
                "Demis Hassabis": {
                    name: "Demis Hassabis",
                    category: "Technology",
                    epoch: "Future",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Demis_Hassabis_portraits_276ce10f.jpg",
                        ],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Hippocrates": {
                    name: "Hippocrates",
                    category: "Science",
                    epoch: "Ancient",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hippocrates_portraits_da345e8a.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hippocrates_achievements_909ddba4.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hippocrates_inventions_2c1e21f3.png",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hippocrates_inventions_799e8619.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hippocrates_artifacts_0c564502.png",
                        ],
                    }
                },
                "Euclid": {
                    name: "Euclid",
                    category: "Science",
                    epoch: "Ancient",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Euclid_portraits_de60ed81.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Euclid_portraits_7c95cac5.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Euclid_achievements_d6c01e40.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Euclid_inventions_d1fd6996.jpg",
                        ],
                        artifacts: [],
                    }
                },
                "Aristotle": {
                    name: "Aristotle",
                    category: "Science",
                    epoch: "Ancient",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Aristotle_portraits_55874cb0.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Aristotle_achievements_55874cb0.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Aristotle_inventions_61381e77.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Aristotle_inventions_e214132c.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Aristotle_artifacts_35cd199b.jpg",
                        ],
                    }
                },
                "Ibn al-Haytham": {
                    name: "Ibn al-Haytham",
                    category: "Science",
                    epoch: "Medieval",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Ibn_al_Haytham_portraits_2d12af86.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Ibn_al_Haytham_portraits_8ea795b0.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Ibn_al_Haytham_achievements_8ea795b0.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Ibn_al_Haytham_inventions_2d12af86.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Ibn_al_Haytham_inventions_8ea795b0.jpg",
                        ],
                        artifacts: [],
                    }
                },
                "Roger Bacon": {
                    name: "Roger Bacon",
                    category: "Science",
                    epoch: "Medieval",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Roger_Bacon_portraits_9370bf8c.jpg",
                        ],
                        achievements: [],
                        inventions: [],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Roger_Bacon_artifacts_c3f9f978.jpg",
                        ],
                    }
                },
                "Hildegard of Bingen": {
                    name: "Hildegard of Bingen",
                    category: "Science",
                    epoch: "Medieval",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hildegard_of_Bingen_portraits_134e8ab9.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hildegard_of_Bingen_portraits_57ab1ea8.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hildegard_of_Bingen_achievements_57ab1ea8.jpg",
                        ],
                        inventions: [],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hildegard_of_Bingen_artifacts_134e8ab9.jpg",
                        ],
                    }
                },
                "Charles Darwin": {
                    name: "Charles Darwin",
                    category: "Science",
                    epoch: "Industrial",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Charles_Darwin_portraits_fbf9123e.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Charles_Darwin_achievements_91ae2360.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Charles_Darwin_inventions_5adee096.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Charles_Darwin_artifacts_f2138e95.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Charles_Darwin_artifacts_6e7ebf7e.jpg",
                        ],
                    }
                },
                "Louis Pasteur": {
                    name: "Louis Pasteur",
                    category: "Science",
                    epoch: "Industrial",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Louis_Pasteur_portraits_cf31feb8.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Louis_Pasteur_portraits_2e34e09a.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Louis_Pasteur_achievements_7650b63d.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Louis_Pasteur_inventions_7650b63d.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Louis_Pasteur_inventions_cf31feb8.jpg",
                        ],
                        artifacts: [],
                    }
                },
                "Dmitri Mendeleev": {
                    name: "Dmitri Mendeleev",
                    category: "Science",
                    epoch: "Industrial",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Dmitri_Mendeleev_portraits_7aeb73ee.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Dmitri_Mendeleev_portraits_889297ee.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Dmitri_Mendeleev_achievements_29fe9c97.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Dmitri_Mendeleev_inventions_14077fa8.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Dmitri_Mendeleev_artifacts_7aeb73ee.jpg",
                        ],
                    }
                },
                "Rosalind Franklin": {
                    name: "Rosalind Franklin",
                    category: "Science",
                    epoch: "Modern",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Rosalind_Franklin_portraits_4748401c.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Rosalind_Franklin_achievements_971c2865.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Rosalind_Franklin_inventions_971c2865.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Rosalind_Franklin_artifacts_971c2865.jpg",
                        ],
                    }
                },
                "Albert Einstein": {
                    name: "Albert Einstein",
                    category: "Science",
                    epoch: "Modern",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Albert_Einstein_portraits_1388791e.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Albert_Einstein_portraits_d17d4ef0.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Albert_Einstein_inventions_1388791e.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Albert_Einstein_artifacts_4119d16a.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Albert_Einstein_artifacts_1388791e.jpg",
                        ],
                    }
                },
                "Jennifer Doudna": {
                    name: "Jennifer Doudna",
                    category: "Science",
                    epoch: "Modern",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Jennifer_Doudna_portraits_36706738.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Jennifer_Doudna_achievements_587a8ef7.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Jennifer_Doudna_inventions_5e9207c9.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Jennifer_Doudna_artifacts_5e9207c9.jpg",
                        ],
                    }
                },
                "Youyou Tu": {
                    name: "Youyou Tu",
                    category: "Science",
                    epoch: "Future",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Youyou_Tu_portraits_9bea34e4.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Youyou_Tu_inventions_05d37ba5.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Youyou_Tu_artifacts_05d37ba5.jpg",
                        ],
                    }
                },
                "David Sinclair": {
                    name: "David Sinclair",
                    category: "Science",
                    epoch: "Future",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Fictional Quantum Pioneer": {
                    name: "Fictional Quantum Pioneer",
                    category: "Science",
                    epoch: "Future",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Phidias": {
                    name: "Phidias",
                    category: "Art",
                    epoch: "Ancient",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Phidias_portraits_f3a78a63.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Phidias_achievements_f3a78a63.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Phidias_inventions_0914dd52.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Phidias_artifacts_f3a78a63.jpg",
                        ],
                    }
                },
                "Polygnotus": {
                    name: "Polygnotus",
                    category: "Art",
                    epoch: "Ancient",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Imhotep": {
                    name: "Imhotep",
                    category: "Art",
                    epoch: "Ancient",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Imhotep_portraits_491c0889.jpg",
                        ],
                        achievements: [],
                        inventions: [],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Imhotep_artifacts_dfd2e934.jpg",
                        ],
                    }
                },
                "Giotto di Bondone": {
                    name: "Giotto di Bondone",
                    category: "Art",
                    epoch: "Medieval",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Hildegard of Bingen": {
                    name: "Hildegard of Bingen",
                    category: "Art",
                    epoch: "Medieval",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hildegard_of_Bingen_portraits_134e8ab9.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hildegard_of_Bingen_portraits_57ab1ea8.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hildegard_of_Bingen_achievements_57ab1ea8.jpg",
                        ],
                        inventions: [],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hildegard_of_Bingen_artifacts_134e8ab9.jpg",
                        ],
                    }
                },
                "Andrei Rublev": {
                    name: "Andrei Rublev",
                    category: "Art",
                    epoch: "Medieval",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Andrei_Rublev_portraits_e01217d8.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Andrei_Rublev_inventions_e01217d8.jpg",
                        ],
                        artifacts: [],
                    }
                },
                "Claude Monet": {
                    name: "Claude Monet",
                    category: "Art",
                    epoch: "Industrial",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Claude_Monet_portraits_e66d9089.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Claude_Monet_portraits_d514b37f.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Claude_Monet_achievements_ee0b911d.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Claude_Monet_inventions_e2cb890b.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Claude_Monet_artifacts_3a5c0227.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Claude_Monet_artifacts_d514b37f.jpg",
                        ],
                    }
                },
                "William Blake": {
                    name: "William Blake",
                    category: "Art",
                    epoch: "Industrial",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/William_Blake_portraits_e371afad.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/William_Blake_achievements_9000037d.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/William_Blake_inventions_313c1606.jpg",
                        ],
                        artifacts: [],
                    }
                },
                "Gustave Courbet": {
                    name: "Gustave Courbet",
                    category: "Art",
                    epoch: "Industrial",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Frida Kahlo": {
                    name: "Frida Kahlo",
                    category: "Art",
                    epoch: "Modern",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Frida_Kahlo_portraits_9b07d05f.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Frida_Kahlo_portraits_9b07d05f.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Frida_Kahlo_achievements_1fdeb9cc.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Frida_Kahlo_achievements_9b07d05f.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Frida_Kahlo_inventions_d7c17b44.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Frida_Kahlo_artifacts_9b07d05f.jpg",
                        ],
                    }
                },
                "Banksy": {
                    name: "Banksy",
                    category: "Art",
                    epoch: "Modern",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Banksy_portraits_35d7d253.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Banksy_achievements_fe32d6b9.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Banksy_achievements_d7c0158c.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Banksy_inventions_6b2033d0.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Banksy_artifacts_3eba2f2c.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Banksy_artifacts_35d7d253.jpg",
                        ],
                    }
                },
                "Yayoi Kusama": {
                    name: "Yayoi Kusama",
                    category: "Art",
                    epoch: "Modern",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Yayoi_Kusama_portraits_2b9a6ca2.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Yayoi_Kusama_achievements_7573b687.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Yayoi_Kusama_inventions_b79d37f7.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Yayoi_Kusama_artifacts_4360b02f.png",
                        ],
                    }
                },
                "Refik Anadol": {
                    name: "Refik Anadol",
                    category: "Art",
                    epoch: "Future",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Sofia Crespo": {
                    name: "Sofia Crespo",
                    category: "Art",
                    epoch: "Future",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Fictional Holographic Artist": {
                    name: "Fictional Holographic Artist",
                    category: "Art",
                    epoch: "Future",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Theophrastus": {
                    name: "Theophrastus",
                    category: "Nature",
                    epoch: "Ancient",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Theophrastus_inventions_55874cb0.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Theophrastus_artifacts_afca15f4.jpg",
                        ],
                    }
                },
                "Empedocles": {
                    name: "Empedocles",
                    category: "Nature",
                    epoch: "Ancient",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Empedocles_inventions_dcdaf69f.jpg",
                        ],
                        artifacts: [],
                    }
                },
                "Huang Di": {
                    name: "Huang Di",
                    category: "Nature",
                    epoch: "Ancient",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Huang_Di_portraits_8d710e22.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Huang_Di_inventions_08a394e7.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Huang_Di_artifacts_08a394e7.jpg",
                        ],
                    }
                },
                "Albertus Magnus": {
                    name: "Albertus Magnus",
                    category: "Nature",
                    epoch: "Medieval",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Albertus_Magnus_portraits_a8cff104.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Albertus_Magnus_achievements_b73388bf.jpg",
                        ],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Avicenna": {
                    name: "Avicenna",
                    category: "Nature",
                    epoch: "Medieval",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Avicenna_portraits_2470f5c8.png",
                        ],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Saint Francis of Assisi": {
                    name: "Saint Francis of Assisi",
                    category: "Nature",
                    epoch: "Medieval",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Saint_Francis_of_Assisi_portraits_2e0bb9a9.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Saint_Francis_of_Assisi_inventions_fc18b495.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Saint_Francis_of_Assisi_artifacts_2e0bb9a9.jpg",
                        ],
                    }
                },
                "Charles Darwin": {
                    name: "Charles Darwin",
                    category: "Nature",
                    epoch: "Industrial",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Charles_Darwin_portraits_fbf9123e.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Charles_Darwin_achievements_bcca7030.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Charles_Darwin_achievements_4a2f9e34.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Charles_Darwin_inventions_5adee096.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Charles_Darwin_artifacts_f2138e95.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Charles_Darwin_artifacts_6e7ebf7e.jpg",
                        ],
                    }
                },
                "John James Audubon": {
                    name: "John James Audubon",
                    category: "Nature",
                    epoch: "Industrial",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/John_James_Audubon_artifacts_0c00531b.jpg",
                        ],
                    }
                },
                "Mary Anning": {
                    name: "Mary Anning",
                    category: "Nature",
                    epoch: "Industrial",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Mary_Anning_portraits_3456571d.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Mary_Anning_portraits_3456571d.jpg",
                        ],
                        achievements: [],
                        inventions: [],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Mary_Anning_artifacts_3028759d.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Mary_Anning_artifacts_3456571d.jpg",
                        ],
                    }
                },
                "Jane Goodall": {
                    name: "Jane Goodall",
                    category: "Nature",
                    epoch: "Modern",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Jane_Goodall_portraits_5937c3e4.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Jane_Goodall_achievements_eb08ff7d.jpg",
                        ],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "David Attenborough": {
                    name: "David Attenborough",
                    category: "Nature",
                    epoch: "Modern",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/David_Attenborough_portraits_38a93a78.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/David_Attenborough_portraits_ba805edb.jpg",
                        ],
                        achievements: [],
                        inventions: [],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/David_Attenborough_artifacts_38a93a78.jpg",
                        ],
                    }
                },
                "Wangari Maathai": {
                    name: "Wangari Maathai",
                    category: "Nature",
                    epoch: "Modern",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Wangari_Maathai_portraits_c1d2a073.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Wangari_Maathai_inventions_c1d2a073.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Wangari_Maathai_artifacts_c1d2a073.jpg",
                        ],
                    }
                },
                "Fictional Climate Engineer": {
                    name: "Fictional Climate Engineer",
                    category: "Nature",
                    epoch: "Future",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Mercedes Bustamante": {
                    name: "Mercedes Bustamante",
                    category: "Nature",
                    epoch: "Future",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Mercedes_Bustamante_portraits_b4ed16a5.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Mercedes_Bustamante_portraits_b4ed16a5.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Mercedes_Bustamante_inventions_b4ed16a5.jpg",
                        ],
                        artifacts: [],
                    }
                },
                "Paul Stamets": {
                    name: "Paul Stamets",
                    category: "Nature",
                    epoch: "Future",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Paul_Stamets_portraits_67292061.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Paul_Stamets_inventions_67292061.jpg",
                        ],
                        artifacts: [],
                    }
                },
                "Milo of Croton": {
                    name: "Milo of Croton",
                    category: "Sports",
                    epoch: "Ancient",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Milo_of_Croton_portraits_aab5aee7.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Milo_of_Croton_achievements_07f54795.png",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Milo_of_Croton_inventions_e58183af.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Milo_of_Croton_inventions_4904be91.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Milo_of_Croton_artifacts_4904be91.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Milo_of_Croton_artifacts_4904be91.jpg",
                        ],
                    }
                },
                "Leonidas of Rhodes": {
                    name: "Leonidas of Rhodes",
                    category: "Sports",
                    epoch: "Ancient",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Gaius Appuleius Diocles": {
                    name: "Gaius Appuleius Diocles",
                    category: "Sports",
                    epoch: "Ancient",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "William Marshal": {
                    name: "William Marshal",
                    category: "Sports",
                    epoch: "Medieval",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/William_Marshal_portraits_fec294c6.jpg",
                        ],
                        achievements: [],
                        inventions: [],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/William_Marshal_artifacts_fec294c6.jpg",
                        ],
                    }
                },
                "Robin Hood": {
                    name: "Robin Hood",
                    category: "Sports",
                    epoch: "Medieval",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Robin_Hood_portraits_0bfa618c.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Robin_Hood_portraits_8b3d21e0.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Robin_Hood_achievements_8c3453c3.jpg",
                        ],
                        inventions: [],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Robin_Hood_artifacts_be4ac7c5.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Robin_Hood_artifacts_e0df34d0.jpg",
                        ],
                    }
                },
                "Richard FitzAlan": {
                    name: "Richard FitzAlan",
                    category: "Sports",
                    epoch: "Medieval",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Richard_FitzAlan_portraits_932516dd.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Richard_FitzAlan_portraits_7e609bed.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Richard_FitzAlan_inventions_7e609bed.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Richard_FitzAlan_artifacts_338c7fb5.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Richard_FitzAlan_artifacts_7e609bed.jpg",
                        ],
                    }
                },
                "W.G. Grace": {
                    name: "W.G. Grace",
                    category: "Sports",
                    epoch: "Industrial",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/WG_Grace_portraits_99cbdeef.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/WG_Grace_inventions_096620ee.jpg",
                        ],
                        artifacts: [],
                    }
                },
                "Pierre de Coubertin": {
                    name: "Pierre de Coubertin",
                    category: "Sports",
                    epoch: "Industrial",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Pierre_de_Coubertin_portraits_c3380b03.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Pierre_de_Coubertin_portraits_c3380b03.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Pierre_de_Coubertin_achievements_c3380b03.jpg",
                        ],
                        inventions: [],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Pierre_de_Coubertin_artifacts_c3380b03.jpg",
                        ],
                    }
                },
                "James Naismith": {
                    name: "James Naismith",
                    category: "Sports",
                    epoch: "Industrial",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/James_Naismith_portraits_50044536.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/James_Naismith_achievements_50044536.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/James_Naismith_inventions_50044536.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/James_Naismith_inventions_50044536.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/James_Naismith_artifacts_50044536.jpg",
                        ],
                    }
                },
                "Serena Williams": {
                    name: "Serena Williams",
                    category: "Sports",
                    epoch: "Modern",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Serena_Williams_portraits_36cb2048.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Serena_Williams_portraits_6169ff39.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Serena_Williams_achievements_22f8df23.jpg",
                        ],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Pelé": {
                    name: "Pelé",
                    category: "Sports",
                    epoch: "Modern",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Pelé_portraits_94f6a0d1.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Pelé_inventions_599f3c0a.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Pelé_inventions_f7eeea4f.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Pelé_artifacts_6aa47410.jpg",
                        ],
                    }
                },
                "Simone Biles": {
                    name: "Simone Biles",
                    category: "Sports",
                    epoch: "Modern",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Simone_Biles_portraits_af499079.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Simone_Biles_achievements_af499079.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Simone_Biles_inventions_af499079.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Simone_Biles_artifacts_af499079.jpg",
                        ],
                    }
                },
                "World E-Sports Champion": {
                    name: "World E-Sports Champion",
                    category: "Sports",
                    epoch: "Future",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "First Cyborg Athlete": {
                    name: "First Cyborg Athlete",
                    category: "Sports",
                    epoch: "Future",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Zero-gravity Sports Inventor": {
                    name: "Zero-gravity Sports Inventor",
                    category: "Sports",
                    epoch: "Future",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Sappho": {
                    name: "Sappho",
                    category: "Music",
                    epoch: "Ancient",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Sappho_portraits_ebd4fa1e.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Sappho_achievements_3ec8b18d.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Sappho_inventions_b5891fb5.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Sappho_artifacts_e61ed26e.jpg",
                        ],
                    }
                },
                "King David": {
                    name: "King David",
                    category: "Music",
                    epoch: "Ancient",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/King_David_portraits_f07ea621.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/King_David_portraits_1f34a858.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/King_David_achievements_722400bd.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/King_David_inventions_eb96934f.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/King_David_inventions_c72b8a02.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/King_David_artifacts_2060a61e.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/King_David_artifacts_f07ea621.jpg",
                        ],
                    }
                },
                "Narada": {
                    name: "Narada",
                    category: "Music",
                    epoch: "Ancient",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Narada_portraits_9343244f.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Narada_inventions_c33b14ab.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Narada_artifacts_88696296.png",
                        ],
                    }
                },
                "Guillaume de Machaut": {
                    name: "Guillaume de Machaut",
                    category: "Music",
                    epoch: "Medieval",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Guillaume_de_Machaut_portraits_9e7297f0.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Guillaume_de_Machaut_inventions_9e7297f0.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Guillaume_de_Machaut_artifacts_9e7297f0.jpg",
                        ],
                    }
                },
                "Hildegard von Bingen": {
                    name: "Hildegard von Bingen",
                    category: "Music",
                    epoch: "Medieval",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hildegard_von_Bingen_portraits_134e8ab9.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hildegard_von_Bingen_portraits_57ab1ea8.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hildegard_von_Bingen_achievements_57ab1ea8.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hildegard_von_Bingen_inventions_277deee3.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hildegard_von_Bingen_artifacts_134e8ab9.jpg",
                        ],
                    }
                },
                "Alfonso el Sabio": {
                    name: "Alfonso el Sabio",
                    category: "Music",
                    epoch: "Medieval",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Alfonso_el_Sabio_portraits_b04a94f9.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Alfonso_el_Sabio_inventions_b04a94f9.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Alfonso_el_Sabio_artifacts_b04a94f9.jpg",
                        ],
                    }
                },
                "Ludwig van Beethoven": {
                    name: "Ludwig van Beethoven",
                    category: "Music",
                    epoch: "Industrial",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Ludwig_van_Beethoven_portraits_e32940dd.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Ludwig_van_Beethoven_portraits_082bf6e4.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Ludwig_van_Beethoven_achievements_082bf6e4.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Ludwig_van_Beethoven_inventions_082bf6e4.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Ludwig_van_Beethoven_artifacts_082bf6e4.jpg",
                        ],
                    }
                },
                "Fanny Mendelssohn": {
                    name: "Fanny Mendelssohn",
                    category: "Music",
                    epoch: "Industrial",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Fanny_Mendelssohn_portraits_df3363af.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Fanny_Mendelssohn_portraits_df3363af.jpg",
                        ],
                        achievements: [],
                        inventions: [],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Fanny_Mendelssohn_artifacts_df3363af.jpg",
                        ],
                    }
                },
                "Frédéric Chopin": {
                    name: "Frédéric Chopin",
                    category: "Music",
                    epoch: "Industrial",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Frédéric_Chopin_portraits_588ba207.jpeg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Frédéric_Chopin_achievements_1925e806.jpg",
                        ],
                        inventions: [],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Frédéric_Chopin_artifacts_9c59353f.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Frédéric_Chopin_artifacts_29bcf7b4.jpg",
                        ],
                    }
                },
                "Louis Armstrong": {
                    name: "Louis Armstrong",
                    category: "Music",
                    epoch: "Modern",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Louis_Armstrong_portraits_aca085dc.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Louis_Armstrong_portraits_fa824e50.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Louis_Armstrong_achievements_fdce4e24.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Louis_Armstrong_inventions_c9ef710b.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Louis_Armstrong_artifacts_5ce6b1f0.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Louis_Armstrong_artifacts_6af66451.jpg",
                        ],
                    }
                },
                "The Beatles": {
                    name: "The Beatles",
                    category: "Music",
                    epoch: "Modern",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/The_Beatles_portraits_391c37f7.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/The_Beatles_portraits_9b98e60f.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/The_Beatles_achievements_650ddd5a.jpeg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/The_Beatles_inventions_a99313da.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/The_Beatles_inventions_7c98dc57.jpg",
                        ],
                        artifacts: [],
                    }
                },
                "BTS": {
                    name: "BTS",
                    category: "Music",
                    epoch: "Modern",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/BTS_portraits_bdf360a4.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/BTS_achievements_5482cac4.jpg",
                        ],
                        inventions: [],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/BTS_artifacts_99f56bf1.jpg",
                        ],
                    }
                },
                "Holly Herndon": {
                    name: "Holly Herndon",
                    category: "Music",
                    epoch: "Future",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Holly_Herndon_inventions_f6f75741.webp",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Holly_Herndon_artifacts_f6f75741.webp",
                        ],
                    }
                },
                "Yannick Nézet-Séguin": {
                    name: "Yannick Nézet-Séguin",
                    category: "Music",
                    epoch: "Future",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Universal Music AI": {
                    name: "Universal Music AI",
                    category: "Music",
                    epoch: "Future",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Ptolemy": {
                    name: "Ptolemy",
                    category: "Space",
                    epoch: "Ancient",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Ptolemy_portraits_2f65da4f.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Ptolemy_achievements_2f65da4f.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Ptolemy_inventions_be00d18e.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Ptolemy_artifacts_365c09ce.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Ptolemy_artifacts_7beeab5a.jpg",
                        ],
                    }
                },
                "Aryabhata": {
                    name: "Aryabhata",
                    category: "Space",
                    epoch: "Ancient",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Aryabhata_portraits_431dab6c.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Aryabhata_inventions_431dab6c.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Aryabhata_artifacts_431dab6c.jpg",
                        ],
                    }
                },
                "Hypatia": {
                    name: "Hypatia",
                    category: "Space",
                    epoch: "Ancient",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hypatia_portraits_4c056ab1.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hypatia_inventions_fe8d08e1.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Hypatia_inventions_fe8d08e1.jpg",
                        ],
                        artifacts: [],
                    }
                },
                "Al-Battani": {
                    name: "Al-Battani",
                    category: "Space",
                    epoch: "Medieval",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Al_Battani_portraits_225e00d3.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Al_Battani_achievements_225e00d3.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Al_Battani_inventions_225e00d3.jpg",
                        ],
                        artifacts: [],
                    }
                },
                "Nasir al-Din al-Tusi": {
                    name: "Nasir al-Din al-Tusi",
                    category: "Space",
                    epoch: "Medieval",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Geoffrey Chaucer": {
                    name: "Geoffrey Chaucer",
                    category: "Space",
                    epoch: "Medieval",
                    images: {
                        portraits: [],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Geoffrey_Chaucer_achievements_3bf0caf3.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Geoffrey_Chaucer_inventions_3bf0caf3.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Geoffrey_Chaucer_artifacts_943fd664.jpg",
                        ],
                    }
                },
                "Galileo Galilei": {
                    name: "Galileo Galilei",
                    category: "Space",
                    epoch: "Industrial",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Galileo_Galilei_portraits_79289be6.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Galileo_Galilei_portraits_0e45574f.jpg",
                        ],
                        achievements: [],
                        inventions: [],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Galileo_Galilei_artifacts_79289be6.jpg",
                        ],
                    }
                },
                "Edmond Halley": {
                    name: "Edmond Halley",
                    category: "Space",
                    epoch: "Industrial",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Edmond_Halley_portraits_d2920c7b.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Edmond_Halley_achievements_d2920c7b.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Edmond_Halley_inventions_d2920c7b.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Edmond_Halley_artifacts_d2920c7b.jpg",
                        ],
                    }
                },
                "Caroline Herschel": {
                    name: "Caroline Herschel",
                    category: "Space",
                    epoch: "Industrial",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Caroline_Herschel_portraits_6503d900.jpg",
                        ],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Yuri Gagarin": {
                    name: "Yuri Gagarin",
                    category: "Space",
                    epoch: "Modern",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Yuri_Gagarin_artifacts_327b49a9.jpg",
                        ],
                    }
                },
                "Katherine Johnson": {
                    name: "Katherine Johnson",
                    category: "Space",
                    epoch: "Modern",
                    images: {
                        portraits: [],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Katherine_Johnson_achievements_52d05ecc.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Katherine_Johnson_inventions_6244d7b9.jpeg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Katherine_Johnson_artifacts_52d05ecc.jpg",
                        ],
                    }
                },
                "Stephen Hawking": {
                    name: "Stephen Hawking",
                    category: "Space",
                    epoch: "Modern",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Stephen_Hawking_portraits_1e5160dc.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Stephen_Hawking_inventions_b6406c62.jpg",
                        ],
                        artifacts: [],
                    }
                },
                "Mars Colony Leader": {
                    name: "Mars Colony Leader",
                    category: "Space",
                    epoch: "Future",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Exoplanet Signal Analyst": {
                    name: "Exoplanet Signal Analyst",
                    category: "Space",
                    epoch: "Future",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "AI Probe Architect": {
                    name: "AI Probe Architect",
                    category: "Space",
                    epoch: "Future",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Zhang Heng": {
                    name: "Zhang Heng",
                    category: "Innovation",
                    epoch: "Ancient",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Ctesibius": {
                    name: "Ctesibius",
                    category: "Innovation",
                    epoch: "Ancient",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Aeneas Tacticus": {
                    name: "Aeneas Tacticus",
                    category: "Innovation",
                    epoch: "Ancient",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Aeneas_Tacticus_portraits_7211982c.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Aeneas_Tacticus_portraits_51bb0521.jpg",
                        ],
                        achievements: [],
                        inventions: [],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Aeneas_Tacticus_artifacts_51bb0521.jpg",
                        ],
                    }
                },
                "Al-Jazari": {
                    name: "Al-Jazari",
                    category: "Innovation",
                    epoch: "Medieval",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Al_Jazari_portraits_cc51b6e4.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Al_Jazari_inventions_789d38a8.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Al_Jazari_inventions_cc51b6e4.jpg",
                        ],
                        artifacts: [],
                    }
                },
                "Richard of Wallingford": {
                    name: "Richard of Wallingford",
                    category: "Innovation",
                    epoch: "Medieval",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Richard_of_Wallingford_portraits_c7ad3342.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Richard_of_Wallingford_portraits_c7ad3342.jpg",
                        ],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Richard_of_Wallingford_inventions_a0edc143.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Richard_of_Wallingford_artifacts_c7ad3342.jpg",
                        ],
                    }
                },
                "Leonardo Fibonacci": {
                    name: "Leonardo Fibonacci",
                    category: "Innovation",
                    epoch: "Medieval",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Thomas Edison": {
                    name: "Thomas Edison",
                    category: "Innovation",
                    epoch: "Industrial",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Thomas_Edison_portraits_4f7dd665.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Thomas_Edison_achievements_93dc0c66.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Thomas_Edison_achievements_4a9e638d.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Thomas_Edison_inventions_4a9e638d.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Thomas_Edison_inventions_4a9e638d.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Thomas_Edison_artifacts_e508e20f.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Thomas_Edison_artifacts_1c57ad8e.jpg",
                        ],
                    }
                },
                "Nikola Tesla": {
                    name: "Nikola Tesla",
                    category: "Innovation",
                    epoch: "Industrial",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Nikola_Tesla_artifacts_feb3b172.jpg",
                        ],
                    }
                },
                "Alexander Graham Bell": {
                    name: "Alexander Graham Bell",
                    category: "Innovation",
                    epoch: "Industrial",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Alexander_Graham_Bell_portraits_b6124f6d.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Alexander_Graham_Bell_achievements_fbb3fd95.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Alexander_Graham_Bell_achievements_fbb3fd95.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Alexander_Graham_Bell_inventions_b6124f6d.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Alexander_Graham_Bell_inventions_b6124f6d.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Alexander_Graham_Bell_artifacts_b6124f6d.jpg",
                        ],
                    }
                },
                "Grace Hopper": {
                    name: "Grace Hopper",
                    category: "Innovation",
                    epoch: "Modern",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Grace_Hopper_portraits_4748401c.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Grace_Hopper_achievements_b5e88376.jpg",
                        ],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Shigeru Miyamoto": {
                    name: "Shigeru Miyamoto",
                    category: "Innovation",
                    epoch: "Modern",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Shigeru_Miyamoto_inventions_22b61c81.jpg",
                        ],
                        artifacts: [],
                    }
                },
                "Elon Musk": {
                    name: "Elon Musk",
                    category: "Innovation",
                    epoch: "Modern",
                    images: {
                        portraits: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Elon_Musk_portraits_f63a6c8c.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Elon_Musk_portraits_bdf360a4.jpg",
                        ],
                        achievements: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Elon_Musk_achievements_e1f7d82b.png",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Elon_Musk_achievements_d755474c.jpg",
                        ],
                        inventions: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Elon_Musk_inventions_990d81a7.jpg",
                        ],
                        artifacts: [
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Elon_Musk_artifacts_f9d8a840.jpg",
                            "https://orbgameimages.blob.core.windows.net/historical-figures/Elon_Musk_artifacts_458dbfb6.jpg",
                        ],
                    }
                },
                "Fusion Energy Scientist": {
                    name: "Fusion Energy Scientist",
                    category: "Innovation",
                    epoch: "Future",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Translingual AI Architect": {
                    name: "Translingual AI Architect",
                    category: "Innovation",
                    epoch: "Future",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
                "Synthetic Biology Entrepreneur": {
                    name: "Synthetic Biology Entrepreneur",
                    category: "Innovation",
                    epoch: "Future",
                    images: {
                        portraits: [],
                        achievements: [],
                        inventions: [],
                        artifacts: [],
                    }
                },
            }
        };
    }

    async connect(mongoUri) {
        try {
            this.mongoClient = new MongoClient(mongoUri);
            await this.mongoClient.connect();
            this.db = this.mongoClient.db('orbgame');
            this.collection = this.db.collection('historical_figures_images');
            console.log('✅ BlobStorageImageService connected to MongoDB');
        } catch (error) {
            console.error('❌ BlobStorageImageService MongoDB connection failed:', error);
        }
    }

    async getImagesForFigure(figureName, imageType = 'portraits') {
        try {
            // First try to get from blob storage database
            const figure = this.imageDatabase.figures[figureName];
            if (figure && figure.images[imageType] && figure.images[imageType].length > 0) {
                return figure.images[imageType];
            }
            
            // Fallback to MongoDB
            const result = await this.collection.findOne({ figureName });
            if (result && result.images && result.images[imageType]) {
                return result.images[imageType];
            }
            
            return [];
        } catch (error) {
            console.error('Error getting images for figure:', error);
            return [];
        }
    }

    async getAllFigures() {
        return Object.keys(this.imageDatabase.figures);
    }

    async getFigureStats() {
        const stats = {
            totalFigures: Object.keys(this.imageDatabase.figures).length,
            figuresWithImages: 0,
            totalImages: 0,
            imagesByType: {
                portraits: 0,
                achievements: 0,
                inventions: 0,
                artifacts: 0
            }
        };

        for (const figureName in this.imageDatabase.figures) {
            const figure = this.imageDatabase.figures[figureName];
            let hasImages = false;
            
            for (const imageType in figure.images) {
                const images = figure.images[imageType];
                stats.imagesByType[imageType] += images.length;
                stats.totalImages += images.length;
                if (images.length > 0) hasImages = true;
            }
            
            if (hasImages) stats.figuresWithImages++;
        }

        return stats;
    }

    async close() {
        if (this.mongoClient) {
            await this.mongoClient.close();
        }
    }

    async getImagesForStory(story, category, epoch) {
        try {
            // Extract figure name from story
            let figureName = null;
            
            // Try to extract from headline
            if (story.headline) {
                // Look for patterns like "Charles Darwin:", "Dmitri Mendeleev:", etc.
                const headlineMatch = story.headline.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*):/);
                if (headlineMatch) {
                    figureName = headlineMatch[1];
                } else {
                    // Try to find a name at the beginning
                    const nameMatch = story.headline.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
                    if (nameMatch) {
                        figureName = nameMatch[1];
                    }
                }
            }
            
            // Try to extract from fullText
            if (!figureName && story.fullText) {
                // Look for common patterns in the text
                const textMatch = story.fullText.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
                if (textMatch) {
                    figureName = textMatch[1];
                }
            }
            
            // Try to extract from summary
            if (!figureName && story.summary) {
                const summaryMatch = story.summary.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
                if (summaryMatch) {
                    figureName = summaryMatch[1];
                }
            }
            
            if (!figureName) {
                console.log('⚠️ Could not extract figure name from story');
                return null;
            }
            
            console.log(`🔍 Looking for images for figure: ${figureName}`);
            
            // Check if figure exists in our database
            const figure = this.imageDatabase.figures[figureName];
            if (!figure) {
                console.log(`⚠️ Figure ${figureName} not found in image database`);
                return null;
            }
            
            // Create image array with proper format
            const images = [];
            
            // Add portraits first
            if (figure.images.portraits && figure.images.portraits.length > 0) {
                figure.images.portraits.forEach(url => {
                    images.push({
                        url: url,
                        type: 'portrait',
                        source: 'Blob Storage',
                        reliability: 'High'
                    });
                });
            }
            
            // Add achievements
            if (figure.images.achievements && figure.images.achievements.length > 0) {
                figure.images.achievements.forEach(url => {
                    images.push({
                        url: url,
                        type: 'achievement',
                        source: 'Blob Storage',
                        reliability: 'High'
                    });
                });
            }
            
            // Add inventions
            if (figure.images.inventions && figure.images.inventions.length > 0) {
                figure.images.inventions.forEach(url => {
                    images.push({
                        url: url,
                        type: 'invention',
                        source: 'Blob Storage',
                        reliability: 'High'
                    });
                });
            }
            
            // Add artifacts
            if (figure.images.artifacts && figure.images.artifacts.length > 0) {
                figure.images.artifacts.forEach(url => {
                    images.push({
                        url: url,
                        type: 'artifact',
                        source: 'Blob Storage',
                        reliability: 'High'
                    });
                });
            }
            
            console.log(`✅ Found ${images.length} images for ${figureName}`);
            return images.length > 0 ? images : null;
            
        } catch (error) {
            console.error('❌ Error getting images for story:', error);
            return null;
        }
    }

    async getImageStats() {
        try {
            const stats = await this.getFigureStats();
            
            return {
                totalFigures: stats.totalFigures,
                totalCategories: 8, // We have 8 categories
                storedFigures: stats.figuresWithImages,
                storedCategories: 8, // All categories have images
                databaseConnected: this.mongoClient ? true : false,
                source: "Real Images - Blob Storage"
            };
        } catch (error) {
            console.error('❌ Error getting real image stats:', error.message);
            return {
                totalFigures: Object.keys(this.imageDatabase.figures).length,
                totalCategories: 8,
                storedFigures: 0,
                storedCategories: 0,
                databaseConnected: false,
                error: error.message,
                source: "Real Images - Blob Storage"
            };
        }
    }
}

export default BlobStorageImageService;
