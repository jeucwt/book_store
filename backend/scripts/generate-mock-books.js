import fs from 'node:fs';
import path from 'node:path';

const booksDir = path.join(process.cwd(), 'backend', 'data', 'books');
if (!fs.existsSync(booksDir)) {
  fs.mkdirSync(booksDir, { recursive: true });
}

const nxbVanHoc = { TenNXB: 'NXB Văn Học', DiaChi: 'Hà Nội' };
const nxbKimDong = { TenNXB: 'NXB Kim Đồng', DiaChi: 'Hà Nội' };
const nxbTre = { TenNXB: 'NXB Trẻ', DiaChi: 'TP.HCM' };
const nxbHoiNhaVan = { TenNXB: 'NXB Hội Nhà Văn', DiaChi: 'Hà Nội' };

const books = [
  {
    filename: 'truyen_kieu.json',
    data: {
      TenSach: 'Truyện Kiều',
      TacGia: 'Nguyễn Du',
      NamXuatBan: 1820,
      TheLoai: 'Truyện thơ',
      AnhBia: '',
      TomTat: 'Kiệt tác văn học trung đại về cuộc đời trầm luân mười lăm năm của nàng Thúy Kiều tài sắc vẹn toàn.',
      DonGia: 35000,
      SoQuyen: 12,
      NXB: nxbVanHoc,
      chuong: [
        {
          SoChuong: 1,
          TieuDe: 'Chương 1 – Chị em Thúy Kiều và tiết Thanh Minh',
          NoiDung: 'Trăm năm trong cõi người ta, chữ tài chữ mệnh khéo là ghét nhau. Trải qua một cuộc bể dâu, những điều trông thấy mà đau đớn lòng. Đầu lòng hai ả tố nga, Thúy Kiều là chị, em là Thúy Vân. Mai cốt cách tuyết tinh thần, mỗi người một vẻ mười phân vẹn mười. Vân xem trang trọng khác vời, khuôn trăng đầy đặn nét ngài nở nang. Hoa cười ngọc thốt đoan trang, mây thua nước tóc tuyết nhường màu da. Kiều càng sắc sảo mặn mà, so bề tài sắc lại là phần hơn. Làn thu thủy nét xuân sơn, hoa ghen thua thắm liễu hờn kém xanh. Một hai nghiêng nước nghiêng thành, sắc đành đòi một tài đành họa hai. Thông minh vốn sẵn tính trời, pha nghề thi họa đủ mùi ca ngâm. Cung thương lầu bậc ngũ âm, nghề riêng ăn đứt hồ cầm một trương.'
        },
        {
          SoChuong: 2,
          TieuDe: 'Chương 2 – Gặp gỡ Kim Trọng và ước hẹn trăm năm',
          NoiDung: 'Thanh minh trong tiết tháng ba, lễ là tảo mộ hội là đạp thanh. Gần xa nô nức yến anh, chị em sắm sửa bộ hành chơi xuân. Bóng tà như giục cơn sầu, khách đà lãng đãng người hầu dặm khang. Nửa chừng ghé bước cỏ xanh, sè sè nấm đất bên đường rêu phong. Hỏi ra mới biết Đạm Tiên, một đời tài sắc thác oan bên cầu. Kiều thương người bạc mệnh, thắp nén hương mà rơi lệ ngắn dài. Vừa khi ấy có chàng Kim Trọng xuất hiện, phong tư tài mạo tuyệt vời, vào vườn giáp ranh tương tư gặp gỡ nàng. Đôi bên trao kỷ vật, nguyện ước sắc cầm bền chặt trăm năm.'
        },
        {
          SoChuong: 3,
          TieuDe: 'Chương 3 – Gia biến và bước ngoặt bán mình chuộc cha',
          NoiDung: 'Ngờ đâu sóng gió bất ngờ ập xuống gia đình họ Vương. Sai nha kéo đến ầm ầm, vu oan giá họa, cha và em trai bị bắt giam khảo đả tàn nhẫn. Đứng trước cảnh ngộ tan cửa nát nhà, Kiều nuốt nước mắt quyết định hi sinh hạnh phúc riêng để làm tròn chữ hiếu. Nàng nhờ cậy em Thúy Vân thay mình trả nghĩa chàng Kim, rồi chấp nhận bán mình cho Mã Giám Sinh. Một bước sa chân vào chốn hồng trần, Kiều bắt đầu mười lăm năm lưu lạc đầy đau thương tủi nhục giữa cõi trần ai.'
        }
      ]
    }
  },
  {
    filename: 'tat_den.json',
    data: {
      TenSach: 'Tắt đèn',
      TacGia: 'Ngô Tất Tố',
      NamXuatBan: 1939,
      TheLoai: 'Tiểu thuyết',
      AnhBia: '',
      TomTat: 'Bức tranh hiện thực nghiệt ngã về nỗi thống khổ của người nông dân trước sưu cao thuế nặng và sự vùng lên của chị Dậu.',
      DonGia: 28000,
      SoQuyen: 10,
      NXB: nxbVanHoc,
      chuong: [
        {
          SoChuong: 1,
          TieuDe: 'Chương 1 – Tiếng trống thúc sưu',
          NoiDung: 'Không khí làng Đông Xá những ngày thu sưu thuế ngột ngạt và căng thẳng như lò than sắp nổ. Tiếng trống thúc liên hồi điểm từ đình làng vọng ra khắp ngõ ngách thôn xóm, dồn dập đe dọa từng mái tranh rách nát. Anh Dậu vì ốm liệt giường mà không đủ tiền nộp sưu, bị bọn cai lệ trói nghiến mang ra đình đánh đập dã man. Chị Dậu chạy vạy khắp làng không ai cho vay, trong nhà chỉ còn mấy củ khoai còi và đàn chó con mới đẻ. Nỗi tuyệt vọng bủa vây người phụ nữ nghèo khổ.'
        },
        {
          SoChuong: 2,
          TieuDe: 'Chương 2 – Bán con và nỗi đau tột cùng',
          NoiDung: 'Để có tiền nộp nốt phần sưu của người em chồng đã chết, chị Dậu cắn răng dắt cái Tí – đứa con đầu lòng ngoan ngoãn và ổ chó đem bán cho nhà quan cụ Nghị Quế ở thôn Đoài. Nghị Quế keo kiệt, hách dịch ép giá từng đồng từng hào. Cái Tí khóc lóc van xin mẹ đừng bỏ rơi nó, tiếng khóc xé lòng xé ruột khiến chị Dậu tưởng như đứt từng khúc ruột. Cầm mấy đồng bạc cắc đẫm nước mắt trở về làng, chị đau đớn nhận ra sưu cao thuế nặng vẫn chực chờ bóp nghẹt mạng sống gia đình nhỏ.'
        },
        {
          SoChuong: 3,
          TieuDe: 'Chương 3 – Vùng lên quật ngã cai lệ',
          NoiDung: 'Anh Dậu vừa được tha về nằm thở thoi thóp trên chõng tre, chị Dậu vừa bưng bát cháo hoa nguội cho chồng thì cai lệ và người nhà lí trưởng lại xông vào đòi tiền. Tên cai lệ giơ roi tính trói anh Dậu một lần nữa. Ban đầu chị Dậu nhẫn nhịn van lạy tha thiết, nhưng đáp lại chỉ là những cái bạt tai và lời thóa mạ tàn độc. Uất ức dồn nén bùng phát, chị Dậu nghiến răng vùng lên túm cổ áo tên cai lệ, ấn ngã chúi ra thềm rồi quật ngã luôn tên người nhà lí trưởng. Chị vùng chạy ra ngoài màn đêm mịt mù như chính số phận của chị.'
        }
      ]
    }
  },
  {
    filename: 'chi_pheo.json',
    data: {
      TenSach: 'Chí Phèo',
      TacGia: 'Nam Cao',
      NamXuatBan: 1941,
      TheLoai: 'Truyện ngắn',
      AnhBia: '',
      TomTat: 'Tấn bi kịch tha hóa và khát vọng hoàn lương không thành của người nông dân cùng quẫn làng Vũ Đại.',
      DonGia: 26000,
      SoQuyen: 8,
      NXB: nxbHoiNhaVan,
      chuong: [
        {
          SoChuong: 1,
          TieuDe: 'Chương 1 – Tiếng chửi của Chí Phèo',
          NoiDung: 'Hắn vừa đi vừa chửi. Bao giờ cũng thế, cứ rượu xong là hắn chửi. Bắt đầu chửi trời, có hề gì? Trời có của riêng nhà nào? Rồi hắn chửi đời, đời là tất cả nhưng chẳng là ai. Rồi hắn chửi cả làng Vũ Đại, nhưng làng ai cũng nghĩ: chắc nó trừ mình ra! Tức mình hắn chửi đứa chết mẹ nào đẻ ra thân hắn cho hắn khổ thế này. Nhưng hắn đâu biết ai đẻ ra hắn. Hắn chỉ là đứa trẻ bị bỏ rơi ở cái lò gạch cũ, lớn lên đi làm canh điền hiền lành như đất cho nhà Bá Kiến, rồi bị đẩy vào tù ngục oan ức để rồi trở về thành một con quỷ dữ của làng Vũ Đại.'
        },
        {
          SoChuong: 2,
          TieuDe: 'Chương 2 – Cuộc gặp gỡ và bát cháo hành Thị Nở',
          NoiDung: 'Đêm trăng ở vườn chuối ven sông, Chí Phèo gặp Thị Nở – người đàn bà xấu xí, ngơ ngẩn và nghèo khổ nhất làng. Trận sốt mê man đã khiến Chí ngã gục. Sáng hôm sau, Thị Nở mang sang cho hắn một bát cháo hành nóng hổi còn bốc khói nghi ngút. Lần đầu tiên trong đời, Chí được một người đàn bà chăm sóc mà không phải bằng đòn roi hay sự sợ hãi. Hắn nếm bát cháo, thấy mắt ươn ướt, lòng rạo rực những khát khao bình dị thời trai trẻ: một gia đình nhỏ, chồng cuốc mướn cày thuê, vợ dệt vải. Chí thèm lương thiện, hắn muốn làm hòa với mọi người.'
        },
        {
          SoChuong: 3,
          TieuDe: 'Chương 3 – Bước đường cùng và tiếng kêu lương thiện',
          NoiDung: 'Bà cô Thị Nở kiên quyết cấm cháu qua lại với một thằng rạch mặt ăn vạ. Thị Nở ngoúng ngoảy bỏ đi, cánh cửa trở lại làm người của Chí Phèo bị đóng sập vĩnh viễn. Chí lại uống rượu, nhưng càng uống càng tỉnh, càng ngửi thấy hơi cháo hành thoang thoảng đâu đây. Ôm con dao sắc, Chí lảo đảo tìm đến nhà Bá Kiến. Trước vẻ kinh ngạc và hoảng loạn của lão cáo già, Chí gào lên đau đớn: Ai cho tao lương thiện? Làm sao cho mất được những vết mảnh chai trên mặt này? Chí đâm chết Bá Kiến rồi tự kết liễu đời mình trong vũng máu, kết thúc tấn bi kịch kiếp người.'
        }
      ]
    }
  },
  {
    filename: 'so_do.json',
    data: {
      TenSach: 'Số đỏ',
      TacGia: 'Vũ Trọng Phụng',
      NamXuatBan: 1936,
      TheLoai: 'Tiểu thuyết',
      AnhBia: '',
      TomTat: 'Tác phẩm trào phúng đỉnh cao vạch trần xã hội thượng lưu thành thị rởm đời qua bước nhảy vọt của Xuân Tóc Đỏ.',
      DonGia: 32000,
      SoQuyen: 15,
      NXB: nxbVanHoc,
      chuong: [
        {
          SoChuong: 1,
          TieuDe: 'Chương 1 – Khởi đầu từ chân nhặt bóng',
          NoiDung: 'Xuân Tóc Đỏ vốn là một kẻ hạ lưu mồ côi, kiếm sống bằng nghề nhặt bóng quần vợt trên sân bà Phó Đoan. Nhờ một trò lừa bịp vô tình và tính lém lỉnh, hắn được bà Phó Đoan giới thiệu vào làm chân chạy việc cho tiệm may Âu Hóa của vợ chồng Văn Minh. Nơi đây đang phát động phong trào đổi mới y phục, giải phóng phụ nữ kiểu nửa mùa, sính ngoại kệch cỡm. Bằng miệng lưỡi trơn tru học lỏm được vài câu văn minh phương Tây, Xuân nhanh chóng lọt vào mắt xanh của các quý bà quyền quý.'
        },
        {
          SoChuong: 2,
          TieuDe: 'Chương 2 – Đốc tờ Xuân và thi sĩ vĩ đại',
          NoiDung: 'Từ một kẻ mù chữ lượm banh, Xuân được đám trí thức rởm nâng lên hàng đốc tờ y khoa, chuyên gia tâm lý và thi sĩ canh tân. Hắn tham gia cổ vũ cho các mốt ngây thơ, nửa chính chuyên, hở hang của tiệm may Âu Hóa. Cả gia đình cụ cố Hồng mê mẩn hắn vì thấy hắn nói câu nào cũng có vẻ khoa học tân thời. Xuân biến những chuyện lố bịch thành trào lưu thời thượng, kiếm bộn tiền và được giới thượng lưu Hà thành tung hô như vị cứu tinh của nền văn minh hiện đại.'
        },
        {
          SoChuong: 3,
          TieuDe: 'Chương 3 – Đỉnh cao danh vọng và anh hùng cứu quốc',
          NoiDung: 'Bi kịch hài hước lên đến đỉnh điểm trong trận đấu quần vợt giao hữu quốc tế giữa Việt Nam và Xiêm La. Nhờ mưu đồ dàn xếp của chính phủ thuộc địa để tránh chiến tranh, Xuân được lệnh phải nhường chức vô địch cho vua Xiêm. Sau khi nhường nhịn trên sân, Xuân đứng lên hùng hồn diễn thuyết bằng giọng điệu ái quốc bịp bợm. Đám đông cuồng nhiệt tung hô Xuân là bậc vĩ nhân, anh hùng cứu quốc. Kẻ lưu manh chính thức bước lên đài danh vọng tối cao của một xã hội đồi bại.'
        }
      ]
    }
  },
  {
    filename: 'dong_song_hoa.json',
    data: {
      TenSach: 'Dòng sông phẳng lặng',
      TacGia: 'Hoàng Phủ Ngọc Tường',
      NamXuatBan: 1986,
      TheLoai: 'Truyện ngắn',
      AnhBia: '',
      TomTat: 'Những câu chuyện đằm thắm trữ tình và bi tráng gắn liền với dòng sông Hương và con người xứ Huế kiên cường.',
      DonGia: 24000,
      SoQuyen: 7,
      NXB: nxbHoiNhaVan,
      chuong: [
        {
          SoChuong: 1,
          TieuDe: 'Chương 1 – Sông Hương mùa trăng',
          NoiDung: 'Sông Hương qua góc nhìn văn chương hiện lên mềm mại như dải lụa đào vắt ngang qua thành phố cổ kính. Những đêm trăng sáng, mặt nước bồng bềnh ánh bạc, tiếng hò mái nhì mái đẩy cất lên ngân vang da diết từ mạn thuyền nan. Trong lòng dòng sông êm đềm ấy không chỉ có thơ ca nhạc họa mà còn ẩn chứa những mạch ngầm lịch sử hào hùng, gắn bó máu thịt với bao thế hệ cư dân cố đô từ thuở mở cõi dựng cờ.'
        },
        {
          SoChuong: 2,
          TieuDe: 'Chương 2 – Những người con bám trụ',
          NoiDung: 'Giữa những năm tháng chiến tranh khốc liệt, dòng sông phẳng lặng bỗng chốc trở thành ranh giới sinh tử. Những cô du kích Huế tuổi đời mới mười tám đôi mươi dũng cảm chèo đò vượt sông dưới làn mưa bom bão đạn đưa bộ đội sang bờ. Tình yêu đôi lứa nảy nở giữa chiến hào, mộc mạc và son sắt như hoa lục bình trôi dạt nhưng không bao giờ lụi tàn trước giông bão thời đại.'
        },
        {
          SoChuong: 3,
          TieuDe: 'Chương 3 – Khúc ca hòa bình',
          NoiDung: 'Hòa bình lập lại trên mảnh đất miền Trung nắng gió, dòng sông lại tìm về vẻ đẹp trầm mặc vốn có của nó. Những cựu chiến binh gặp lại nhau bên bến đò xưa, thả những nhành hoa tưởng niệm đồng đội đã ngã xuống nơi đáy sông sâu. Dòng nước vẫn lững lờ trôi, ôm ấp lấy ký ức và gieo mầm niềm tin vào cuộc sống tương lai thanh bình, rực rỡ.'
        }
      ]
    }
  },
  {
    filename: 'nhat_ky_trong_tu.json',
    data: {
      TenSach: 'Nhật ký trong tù',
      TacGia: 'Hồ Chí Minh',
      NamXuatBan: 1960,
      TheLoai: 'Truyện thơ',
      AnhBia: '',
      TomTat: 'Tập nhật ký bằng thơ chữ Hán khắc họa tinh thần thép, tinh thần lạc quan cách mạng trong chốn lao tù Quảng Tây.',
      DonGia: 22000,
      SoQuyen: 9,
      NXB: nxbVanHoc,
      chuong: [
        {
          SoChuong: 1,
          TieuDe: 'Chương 1 – Thân thể ở trong lao, tinh thần ở ngoài lao',
          NoiDung: 'Thân thể ở trong lao, tinh thần ở ngoài lao. Muốn nên sự nghiệp lớn, tinh thần càng phải cao. Những vần thơ chữ Hán giản dị mà súc tích mở đầu cho chuỗi ngày bị giam cầm oan uổng nơi đất khách. Dù bị cùm xích gông cùm hành hạ, người chiến sĩ cách mạng vẫn giữ vững phong thái ung dung tự tại, hướng tâm hồn về bầu trời tự do và tương lai của dân tộc đang chìm trong bóng tối lầm than.'
        },
        {
          SoChuong: 2,
          TieuDe: 'Chương 2 – Vọng nguyệt và cảnh ngắm trăng',
          NoiDung: 'Trong tù không rượu cũng không hoa, cảnh đẹp đêm nay khó hững hờ. Người ngắm trăng soi ngoài cửa sổ, trăng nhòm khe cửa ngắm nhà thơ. Giữa chốn ngục tù hôi hám tăm tối, tình yêu thiên nhiên và cái đẹp vẫn bừng sáng kì diệu. Sự giao hòa giữa thi nhân và vầng trăng tri kỷ đã xóa nhòa ranh giới chấn song sắt ngục tù, thể hiện cốt cách thi sĩ hào hoa cùng bản lĩnh kiên cường của bậc đại trí.'
        },
        {
          SoChuong: 3,
          TieuDe: 'Chương 3 – Bình minh sau bóng tối',
          NoiDung: 'Hết mưa là nắng hửng lên thôi, gội mát trần gian ánh rạng ngời. Vạn vật tươi vui bừng tỉnh giấc, muôn chim ríu rít hót ca vui. Tập thơ khép lại bằng niềm tin tất thắng vào quy luật tự nhiên và lịch sử. Sau những ngày gian lao trui rèn ý chí thép, người tù vượt qua thử thách ngục tù, sẵn sàng đón nhận ánh bình minh của ngày tự do để trở về lãnh đạo cách mạng nước nhà.'
        }
      ]
    }
  },
  {
    filename: 'vo_chong_a_phu.json',
    data: {
      TenSach: 'Vợ chồng A Phủ',
      TacGia: 'Tô Hoài',
      NamXuatBan: 1952,
      TheLoai: 'Truyện ngắn',
      AnhBia: '',
      TomTat: 'Con đường thức tỉnh và giải phóng của đôi lứa người Mèo vùng cao Tây Bắc dưới ách cường quyền thống lý Pá Tra.',
      DonGia: 27000,
      SoQuyen: 11,
      NXB: nxbKimDong,
      chuong: [
        {
          SoChuong: 1,
          TieuDe: 'Chương 1 – Kiếp dâu trừ nợ nhà thống lý',
          NoiDung: 'Ai ở xa về thường thấy một cô gái ngồi quay sợi gai bên tảng đá trước cửa nhà thống lý Pá Tra, lúc nào mặt cũng cúi buồn rười rượi. Đó là Mị, con dâu gạt nợ nhà giàu. Bố Mị ngày xưa vay bạc của thống lý không trả được, Mị đành cam chịu làm dâu gạt nợ cho A Sử. Ở lâu trong cái khổ, Mị quen khổ rồi. Mị sống lầm lũi như con rùa nuôi trong xó cửa, không còn nhớ đến ước mơ thời thiếu nữ từng thổi lá hay như thổi sáo.'
        },
        {
          SoChuong: 2,
          TieuDe: 'Chương 2 – Đêm tình mùa xuân và sức sống tiềm tàng',
          NoiDung: 'Mùa xuân trên Hồng Ngài năm ấy tràn ngập sắc màu váy hoa sặc sỡ và tiếng sáo gọi bạn tình dặt dìu khắp triền đồi. Nghe tiếng sáo, tâm hồn Mị bỗng rạo rực hồi sinh. Mị uống rượu ừng ực từng bát, Mị thấy mình còn trẻ và muốn đi chơi xuân như bao bạn bè cùng lứa. Dù bị A Sử bắt trói đứng vào cột nhà bằng cả thúng sợi đay, Mị vẫn thả hồn theo tiếng sáo réo rắt bay ra khắp đỉnh núi, chứng minh sức sống mãnh liệt không gì dập tắt nổi.'
        },
        {
          SoChuong: 3,
          TieuDe: 'Chương 3 – Đêm đông cởi trói tìm tự do',
          NoiDung: 'A Phủ vì để hổ ăn thịt mất một con bò của nhà thống lý nên bị trói đứng vào cột ngoài hiên chờ chết. Những đêm đông giá lạnh, Mị ngồi thổi lửa sưởi ấm, liếc mắt nhìn thấy một dòng nước mắt lấp lánh bò xuống hai hõm má xám đen của A Phủ. Lòng trắc ẩn và sự đồng cảm giai cấp thức tỉnh trong Mị. Mị liều mình cầm dao cắt nút dây mây cởi trói cho A Phủ, rồi hốt hoảng chạy theo chàng băng qua bóng đêm rừng thẳm trốn tới Phiềng Sa, bước vào cuộc đời tự do.'
        }
      ]
    }
  },
  {
    filename: 'de_men_phieu_luu_ky.json',
    data: {
      TenSach: 'Dế Mèn phiêu lưu ký',
      TacGia: 'Tô Hoài',
      NamXuatBan: 1941,
      TheLoai: 'Phiêu lưu',
      AnhBia: '',
      TomTat: 'Hành trình trưởng thành đầy ý nghĩa, bài học đường đời đầu tiên và khát vọng kết nghĩa anh em bốn bể của Dế Mèn.',
      DonGia: 30000,
      SoQuyen: 20,
      NXB: nxbKimDong,
      chuong: [
        {
          SoChuong: 1,
          TieuDe: 'Chương 1 – Bài học đường đời đầu tiên',
          NoiDung: 'Tôi là một chú dế mèn cường tráng, đôi càng mẫm bóng, vuốt ở chân cứng và nhọn hoắt. Do tự phụ và kiêu căng, tôi thường cà khịa với mọi bà con láng giềng. Trong một lần nghịch ngợm dại dột, tôi trêu chị Cốc khiến chị tức giận mổ chết chú Dế Choắt gầy gò ốm yếu hàng xóm. Trước khi trút hơi thở cuối cùng, Dế Choắt khuyên tôi: Ở đời mà có thói hung hăng bậy bạ, có óc mà không biết nghĩ, sớm muộn rồi cũng rước họa vào thân. Đó là bài học đắt giá đầu tiên ghi khắc suốt đời tôi.'
        },
        {
          SoChuong: 2,
          TieuDe: 'Chương 2 – Kết nghĩa anh em cùng Dế Trũi',
          NoiDung: 'Rời bỏ quê hương, tôi dấn thân vào cuộc phiêu lưu khắp chốn bãi cỏ bờ sông. Trên đường đi, tôi gặp Dế Trũi gan dạ đang bị bọn Bọ Muỗm bắt nạt. Tôi liền ra tay nghĩa hiệp cứu thoát Trũi. Hai đứa cảm mến tài đức của nhau, cùng uống giọt sương mai thề nguyện kết nghĩa anh em đồng cam cộng khổ. Chúng tôi dắt tay nhau vượt qua thác ghềnh, khám phá thế giới tự nhiên kỳ thú và rộng lớn bao la.'
        },
        {
          SoChuong: 3,
          TieuDe: 'Chương 3 – Ước mơ thế giới đại đồng',
          NoiDung: 'Trải qua muôn vàn gian nan, hiểm nguy từ bẫy chim, hang sâu đến những trận chiến kịch liệt, tôi và Trũi hiểu sâu sắc giá trị của tình đoàn kết. Chúng tôi đi khắp nơi tuyên truyền ước nguyện muôn loài kết nghĩa anh em, xóa bỏ hiềm khích hận thù, cùng nhau chung sống trong hòa bình và bác ái. Tiếng reo hò của muôn loài côn trùng vang dậy đồng cỏ chào đón mùa gặt mới.'
        }
      ]
    }
  },
  {
    filename: 'ong_gia_va_bien_ca.json',
    data: {
      TenSach: 'Ông già và biển cả',
      TacGia: 'Ernest Hemingway',
      NamXuatBan: 1952,
      TheLoai: 'Tiểu thuyết',
      AnhBia: '',
      TomTat: 'Khúc tráng ca bất diệt về ý chí kiên cường của lão ngư Santiago trong cuộc chiến đơn độc với cá kiếm và đàn cá mập.',
      DonGia: 35000,
      SoQuyen: 6,
      NXB: nxbTre,
      chuong: [
        {
          SoChuong: 1,
          TieuDe: 'Chương 1 – Tám mươi tư ngày trắng tay',
          NoiDung: 'Lão già Santiago một mình chèo thuyền trên dòng hải lưu vịnh Mexico suốt tám mươi tư ngày liên tục mà không bắt được lấy một mống cá nào. Cậu bé Manolin thương lão nhưng bị cha mẹ bắt chuyển sang thuyền khác may mắn hơn. Lão già vẫn kiên trì chuẩn bị mồi câu sắc nhọn, tin tưởng tuyệt đối vào vận may của ngày thứ tám mươi lăm. Lão căng buồm ra khơi từ sáng sớm khi trăng còn chưa lặn, hướng thẳng ra vùng biển xa thẳm.'
        },
        {
          SoChuong: 2,
          TieuDe: 'Chương 2 – Cuộc giằng co với con cá kiếm khổng lồ',
          NoiDung: 'Vào giữa trưa ngày thứ tám mươi lăm, sợi dây cước sâu thăm thẳm bỗng giật mạnh. Một con cá kiếm khổng lồ cắn câu. Con cá quá lớn kéo phăng chiếc thuyền con rẽ sóng chạy mải miết ra biển khơi suốt hai ngày hai đêm. Bàn tay lão rách toạc rỉ máu, lưng tê dại vì ghì dây câu, nhưng lão không hề bỏ cuộc. Lão trò chuyện với con cá, vừa tôn trọng vừa quyết tâm hạ gục đối thủ xứng tầm bằng ngọn lao sắc bén găm trúng tim.'
        },
        {
          SoChuong: 3,
          TieuDe: 'Chương 3 – Đàn cá mập và tinh thần bất khuất',
          NoiDung: 'Mùi máu tanh loang trên mặt nước thu hút từng đàn cá mập hung dữ lao đến cắn xé xác cá kiếm. Santiago dùng dao buộc vào mái chèo, rồi dùng chày gỗ tả xung hữu đột chiến đấu kiên cường đến kiệt sức. Dù con cá chỉ còn lại bộ xương trắng khi thuyền cập bến, lão già đã chứng minh chân lý vĩ đại: Con người sinh ra không phải để dành cho thất bại. Con người có thể bị hủy diệt nhưng không thể bị đánh bại.'
        }
      ]
    }
  },
  {
    filename: 'sherlock_holmes.json',
    data: {
      TenSach: 'Những cuộc phiêu lưu của Sherlock Holmes',
      TacGia: 'Arthur Conan Doyle',
      NamXuatBan: 1892,
      TheLoai: 'Trinh thám',
      AnhBia: '',
      TomTat: 'Tập hợp những vụ án ly kỳ, hấp dẫn nhất được giải mã bằng phương pháp suy luận logic tuyệt đỉnh của thám tử Holmes.',
      DonGia: 42000,
      SoQuyen: 14,
      NXB: nxbTre,
      chuong: [
        {
          SoChuong: 1,
          TieuDe: 'Chương 1 – Vụ tai tiếng ở xứ Bohemia',
          NoiDung: 'Tại căn phòng quen thuộc số 221B phố Baker, thám tử lừng danh Sherlock Holmes đón tiếp vị khách quý là Quốc vương xứ Bohemia giả trang. Quốc vương tha thiết nhờ Holmes thu hồi bức ảnh chụp chung bí mật với nữ ca sĩ opera kiều diễm Irene Adler nhằm tránh bê bối ngoại giao. Bằng óc quan sát sắc bén và những màn cải trang mưu mẹo, Holmes suýt chút nữa đoạt lại bức ảnh, nhưng cuối cùng đành ngả mũ thán phục trí thông minh kiệt xuất của người phụ nữ duy nhất qua mặt được ông.'
        },
        {
          SoChuong: 2,
          TieuDe: 'Chương 2 – Hội tóc đỏ kỳ quặc',
          NoiDung: 'Một chủ tiệm cầm đồ tóc đỏ tên Jabez Wilson tìm đến nhờ Holmes giải thích về một công việc kỳ quặc: chép cuốn Bách khoa toàn thư chỉ vì ông ta có mái tóc đỏ rực. Trong khi mọi người xem đây là trò đùa vô hại, Holmes lập tức nhận ra âm mưu đào hầm tinh vi từ tầng hầm tiệm cầm đồ sang kho vàng của ngân hàng bên cạnh. Cùng với bác sĩ Watson và cảnh sát Scotland Yard, Holmes mai phục bắt quả tang tên cướp táo tợn John Clay ngay trong đêm.'
        },
        {
          SoChuong: 3,
          TieuDe: 'Chương 3 – Bí ẩn dải băng đốm',
          NoiDung: 'Tiểu thư Helen Stoner tìm đến cầu cứu Holmes trong tâm trạng hoảng loạn tột cùng về cái chết bí ẩn của người chị gái trước ngày cưới. Qua việc kiểm tra kỹ lưỡng căn phòng với lỗ thông hơi bất thường và sợi dây chuông giả nối xuống giường ngủ, Holmes đã vạch trần tội ác rùng rợn của người cha dượng độc ác: dùng một con rắn độc đầm lầy để sát hại các con gái nhằm chiếm đoạt tài sản thừa kế.'
        }
      ]
    }
  },
  {
    filename: 'hoang_tu_be.json',
    data: {
      TenSach: 'Hoàng tử bé',
      TacGia: 'Antoine de Saint-Exupéry',
      NamXuatBan: 1943,
      TheLoai: 'Tùy bút',
      AnhBia: '',
      TomTat: 'Câu chuyện cổ tích triết lý sâu sắc về tình bạn, tình yêu và cái nhìn trong trẻo của trẻ thơ về thế giới người lớn.',
      DonGia: 30000,
      SoQuyen: 18,
      NXB: nxbTre,
      chuong: [
        {
          SoChuong: 1,
          TieuDe: 'Chương 1 – Cuộc gặp gỡ giữa sa mạc Sahara',
          NoiDung: 'Chiếc máy bay bị hỏng động cơ buộc người phi công phải hạ cánh khẩn cấp giữa sa mạc cát mênh mông không một bóng người. Trong lúc đang cặm cụi sửa chữa từng con ốc vít, ông ngỡ ngàng nghe thấy một giọng nói trong trẻo: Xin chú hãy vẽ cho cháu một con cừu! Đó là cuộc gặp gỡ đầu tiên với Hoàng tử bé – cậu bé đến từ tiểu tinh cầu B612 xa xôi chỉ có ba ngọn núi lửa và một bông hoa hồng kiêu kỳ.'
        },
        {
          SoChuong: 2,
          TieuDe: 'Chương 2 – Những tiểu tinh cầu kỳ lạ',
          NoiDung: 'Hoàng tử bé kể cho người phi công nghe về hành trình chu du qua các hành tinh khác nhau trong vũ trụ. Cậu đã gặp một ông vua mê quyền lực nhưng cô độc, một kẻ hợm hĩnh chỉ thích nghe tán dương, một gã nát rượu uống để quên nỗi xấu hổ vì uống rượu, và một thương nhân bận rộn đếm các vì sao để sở hữu chúng. Thế giới người lớn hiện lên thật kỳ quặc, vô lý và đánh mất đi niềm vui nguyên sơ của cuộc sống.'
        },
        {
          SoChuong: 3,
          TieuDe: 'Chương 3 – Bí mật của chú cáo',
          NoiDung: 'Khi đặt chân đến Trái Đất, Hoàng tử bé gặp gỡ chú cáo thông thái. Cáo đã dạy cho cậu bài học quý giá về sự thuần hóa và trách nhiệm đối với bông hoa hồng duy nhất của mình. Trước khi chia tay, cáo tặng cậu một bí mật giản dị: Người ta chỉ nhìn thấy thật rõ ràng bằng trái tim; điều cốt lõi thì vô hình trong mắt trần. Cậu hiểu rằng chính thời gian cậu dành cho đóa hồng mới khiến bông hoa trở nên quan trọng đến thế.'
        }
      ]
    }
  },
  {
    filename: 'hai_van_dam_duoi_bien.json',
    data: {
      TenSach: 'Hai vạn dặm dưới biển',
      TacGia: 'Jules Verne',
      NamXuatBan: 1870,
      TheLoai: 'Khoa học viễn tưởng',
      AnhBia: '',
      TomTat: 'Chuyến thám hiểm đáy đại dương kỳ vĩ cùng con tàu ngầm Nautilus tân tiến và thuyền trưởng Nemo bí ẩn.',
      DonGia: 38000,
      SoQuyen: 10,
      NXB: nxbKimDong,
      chuong: [
        {
          SoChuong: 1,
          TieuDe: 'Chương 1 – Quái vật biển hay phát minh kỳ tài',
          NoiDung: 'Năm 1866, các vùng biển trên khắp thế giới xôn xao trước sự xuất hiện của một sinh vật bí ẩn khổng lồ di chuyển với tốc độ kinh hoàng, đâm thủng nhiều tàu buôn lớn. Giáo sư Aronnax cùng người giúp việc Conseil và thợ săn cá voi Ned Land tham gia đoàn tàu chiến truy lùng con quái vật. Sau cú va chạm định mệnh, họ rơi xuống biển và bất ngờ phát hiện con quái vật thực chất là một cỗ tàu ngầm khổng lồ bằng thép mang tên Nautilus do thuyền trưởng Nemo chỉ huy.'
        },
        {
          SoChuong: 2,
          TieuDe: 'Chương 2 – Thế giới kỳ quan dưới đáy biển sâu',
          NoiDung: 'Thuyền trưởng Nemo đón tiếp họ với tư cách tù nhân danh dự trên con tàu chạy bằng điện năng tối tân vượt xa thời đại. Qua ô cửa kính trong suốt của phòng khách, Aronnax được chiêm ngưỡng những cánh rừng san hô rực rỡ, những mỏ ngọc trai khổng lồ ở vịnh Bengal và tàn tích của thành phố Atlantis cổ đại chìm sâu dưới đáy đại dương ngàn năm.'
        },
        {
          SoChuong: 3,
          TieuDe: 'Chương 3 – Trận chiến mực khổng lồ và lối thoát hiểm nguy',
          NoiDung: 'Trên đường tiến về phương Bắc, tàu Nautilus bị kẹt giữa bầy mực ống khổng lồ với những chiếc vòi dài ngoằng quấn chặt chân vịt. Nemo cùng thủy thủ đoàn trang bị rìu và súng hơi lao vào trận giáp lá cà sinh tử trên boong tàu để giải cứu đồng đội. Nhân lúc con tàu lọt vào xoáy nước Maelstrom dữ dội gần bờ biển Na Uy, giáo sư Aronnax và các bạn liều mình hạ xuồng trốn thoát, mang theo câu chuyện kỳ diệu về vị thuyền trưởng kỳ tài Nemo.'
        }
      ]
    }
  },
  {
    filename: 'dracula.json',
    data: {
      TenSach: 'Dracula',
      TacGia: 'Bram Stoker',
      NamXuatBan: 1897,
      TheLoai: 'Kinh dị',
      AnhBia: '',
      TomTat: 'Tác phẩm kinh điển khai sinh huyền thoại ma cà rồng Bá tước Dracula và cuộc săn đuổi rùng rợn của nhóm Van Helsing.',
      DonGia: 40000,
      SoQuyen: 8,
      NXB: nxbTre,
      chuong: [
        {
          SoChuong: 1,
          TieuDe: 'Chương 1 – Lâu đài quỷ ám ở Transylvania',
          NoiDung: 'Chàng luật sư trẻ Jonathan Harker thực hiện chuyến công tác đến vùng núi xa xôi Transylvania để hoàn tất thủ tục mua bất động sản tại Luân Đôn cho Bá tước Dracula. Ngay từ khi bước vào lâu đài âm u cổ kính, Harker rùng mình trước vẻ mặt tái nhợt lạnh lẽo và đôi mắt đỏ ngầu của vị bá tước. Chàng kinh hoàng nhận ra mình đã bị giam cầm trong hang ổ của loài ma cà rồng hút máu quỷ quyệt.'
        },
        {
          SoChuong: 2,
          TieuDe: 'Chương 2 – Bóng ma giáng xuống nước Anh',
          NoiDung: 'Dracula bí mật lên con tàu buôn Demeter cập cảng Whitby nước Anh giữa một đêm giông bão kinh hoàng, toàn bộ thủy thủ đoàn đều chết mất tích một cách bí ẩn. Tại Luân Đôn, cô gái trẻ Lucy Westenra bắt đầu mộng du và ngày một xanh xao gầy mòn với hai vết cắn kỳ lạ trên cổ. Dù đã được giáo sư Van Helsing dùng tỏi và thánh giá bảo vệ hết lòng, Lucy vẫn không qua khỏi và biến thành ma cà rồng gieo rắc kinh hoàng.'
        },
        {
          SoChuong: 3,
          TieuDe: 'Chương 3 – Cuộc thanh trừng quyết tử',
          NoiDung: 'Nhận ra hiểm họa đe dọa toàn nhân loại, Van Helsing cùng Jonathan, Mina và những người bạn dũng cảm thành lập đội săn ma cà rồng. Họ lần theo các cỗ quan tài chứa đất mẹ mà Dracula cất giấu để phong ấn bằng bánh thánh. Trong trận truy kích cuối cùng trên sườn núi tuyết Transylvania, họ kịp thời phá nắp quan tài đâm xuyên tim Dracula trước lúc hoàng hôn buông xuống, chấm dứt cơn ác mộng kinh hoàng.'
        }
      ]
    }
  },
  {
    filename: 'ba_chuong_si.json',
    data: {
      TenSach: 'Ba chàng lính ngự lâm',
      TacGia: 'Alexandre Dumas',
      NamXuatBan: 1844,
      TheLoai: 'Phiêu lưu',
      AnhBia: '',
      TomTat: 'Khẩu hiệu kinh điển Một người vì mọi người, mọi người vì một người trong hành trình bảo vệ danh dự hoàng gia của DArtagnan.',
      DonGia: 45000,
      SoQuyen: 12,
      NXB: nxbHoiNhaVan,
      chuong: [
        {
          SoChuong: 1,
          TieuDe: 'Chương 1 – Đấu kiếm và kết tình huynh đệ',
          NoiDung: 'Chàng trai trẻ nghèo dArtagnan rời quê hương xứ Gascony lên Paris hoa lệ với ước mơ gia nhập đội ngự lâm quân của Vua Louis XIII. Do tính khí nóng nảy, chàng liên tiếp thách đấu kiếm với ba chàng lính ngự lâm tài ba: Athos, Porthos và Aramis chỉ trong một buổi trưa. Đúng lúc trận quyết đấu sắp diễn ra, lính cận vệ của Hồng y giáo chủ Richelieu ập đến vây bắt. Bốn chàng trai hiệp lực rút gươm đánh tan đám cận vệ, bắt đầu tình bạn keo sơn gắn bó.'
        },
        {
          SoChuong: 2,
          TieuDe: 'Chương 2 – Chuyến công du đoạt chuỗi kim cương',
          NoiDung: 'Để cứu Hoàng hậu Anne khỏi cái bẫy chính trị tàn độc của Hồng y giáo chủ Richelieu tại vũ hội hoàng gia, dArtagnan và ba người bạn nhận nhiệm vụ bí mật vượt biển sang Anh để lấy lại chuỗi hạt kim cương từ Công tước Buckingham. Trên đường đi, họ bị thích khách của phe Giáo chủ phục kích liên miên. Lần lượt Athos, Porthos và Aramis ở lại cản đường đối phương để dArtagnan phi ngựa xé gió tới Luân Đôn hoàn thành sứ mệnh lịch sử.'
        },
        {
          SoChuong: 3,
          TieuDe: 'Chương 3 – Vạch mặt nữ gián điệp Milady',
          NoiDung: 'Nữ bá tước Milady de Winter – gián điệp nguy hiểm nhất của Hồng y giáo chủ dùng mọi thủ đoạn độc ác, từ đầu độc đến bắt cóc nhằm trả thù dArtagnan. Bốn chàng ngự lâm kiên quyết truy lùng dấu vết mụ đàn bà hiểm độc đến tận bờ sông Lys. Trước tòa án công lý của lương tri, tội ác của Milady bị phơi bày trừng trị thích đáng, đem lại sự bình yên và vinh quang rực rỡ cho đội ngự lâm quân nước Pháp.'
        }
      ]
    }
  },
  {
    filename: 'kieu_hanh_va_dinh_kien.json',
    data: {
      TenSach: 'Kiêu hãnh và định kiến',
      TacGia: 'Jane Austen',
      NamXuatBan: 1813,
      TheLoai: 'Lãng mạn',
      AnhBia: '',
      TomTat: 'Câu chuyện tình yêu đầy trắc trở nhưng sâu sắc giữa Elizabeth Bennet thông minh và quý ngài Darcy cao ngạo.',
      DonGia: 36000,
      SoQuyen: 15,
      NXB: nxbVanHoc,
      chuong: [
        {
          SoChuong: 1,
          TieuDe: 'Chương 1 – Buổi dạ vũ ở Meryton',
          NoiDung: 'Tin tức một chàng trai quý tộc trẻ tuổi, giàu có tên Bingley thuê trang viên Netherfield đã làm xôn xao cả vùng quê nông thôn nước Anh, đặc biệt là gia đình quý bà Bennet có năm cô con gái chưa gả. Tại buổi dạ vũ địa phương, trong khi Bingley thân thiện chiếm trọn cảm tình thì bạn thân của anh – quý ngài Darcy lạnh lùng kiêu ngạo từ chối khiêu vũ với Elizabeth Bennet. Một bức tường định kiến bắt đầu hình thành giữa hai tâm hồn kiêu hãnh.'
        },
        {
          SoChuong: 2,
          TieuDe: 'Chương 2 – Lời cầu hôn đường đột tại Rosings',
          NoiDung: 'Elizabeth vô cùng tức giận khi phát hiện Darcy chính là người đã can thiệp chia cắt mối tình giữa chị gái Jane và Bingley. Đúng lúc ấy, Darcy lại bất ngờ thổ lộ tình yêu cháy bỏng và cầu hôn nàng, nhưng đi kèm những lời lẽ miệt thị gia thế thấp kém của nhà Bennet. Nàng Elizabeth kiên quyết cự tuyệt thẳng thừng. Bức thư giải thích sau đó của Darcy đã khiến Elizabeth bàng hoàng nhận ra mình đã mù quáng vì định kiến cá nhân bấy lâu.'
        },
        {
          SoChuong: 3,
          TieuDe: 'Chương 3 – Hạnh phúc viên mãn ở Pemberley',
          NoiDung: 'Khi gia đình Bennet đối mặt với nguy cơ sụp đổ danh dự vì cô em út Lydia dại dột bỏ trốn cùng tên sĩ quan lừa đảo Wickham, chính Darcy đã âm thầm bỏ tiền bạc và công sức dàn xếp đám cưới êm thấm. Hiểu rõ lòng tốt và phẩm cách cao thượng của Darcy, Elizabeth trút bỏ hoàn toàn định kiến, hạnh phúc nhận lời cầu hôn lần thứ hai của chàng, mở ra cuộc sống lứa đôi trọn vẹn tại trang viên Pemberley xinh đẹp.'
        }
      ]
    }
  }
];

let count = 0;
for (const b of books) {
  const filePath = path.join(booksDir, b.filename);
  fs.writeFileSync(filePath, JSON.stringify(b.data, null, 2), 'utf8');
  console.log(`Đã tạo: ${b.filename}`);
  count++;
}

console.log(`\nHoàn tất tạo ${count} file sách mẫu trong ${booksDir}`);
