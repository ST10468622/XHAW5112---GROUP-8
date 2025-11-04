// App.js - Final polished Expo single-file app
// Dependencies required (add in Snack):
// @react-navigation/native
// @react-navigation/bottom-tabs
// @react-native-async-storage/async-storage
// @expo/vector-icons
// react-native-safe-area-context

import React, { useEffect, useState, createRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  FlatList,
  Platform,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons, Entypo, FontAwesome5 } from "@expo/vector-icons";

const THEME = {
  primary: "#003366",
  accent: "#FFD700",
  bg: "#f3f7ff",
  card: "#ffffff",
};

const STORAGE_KEY = "@en_applications_v1";
const CONTACTS_KEY = "@en_contacts_v1";
const Tab = createBottomTabNavigator();
const navRef = createRef();

// --- Rubric-only courses ---
const COURSES = [
  {
    id: "childminding",
    name: "Child Minding",
    fee: 750,
    durationLabel: "6 weeks",
    summary:
      "Basic child and baby care — safety, feeding, sleep routines, and educational play.",
    details:
      "Covers newborn to toddler care, safety and hygiene, developmental milestones, creating learning activities and basic emergency response for caregivers.",
    type: "short",
  },
  {
    id: "firstaid",
    name: "First Aid",
    fee: 1500,
    durationLabel: "6 weeks",
    summary:
      "Basic first aid and life support — CPR, bleeding control, emergency scene management.",
    details:
      "Learn to evaluate emergencies, treat wounds, burns and fractures, manage breathing issues, and perform CPR. Practical hands-on scenarios included.",
    type: "short",
  },
  {
    id: "lifeskills",
    name: "Life Skills",
    fee: 1500,
    durationLabel: "6 weeks",
    summary:
      "Practical life skills — basic literacy, numeracy, banking, and labour rights.",
    details:
      "Focus on reading, writing, numeracy for daily tasks, opening a bank account, understanding basic labour law and personal budgeting.",
    type: "short",
  },
  {
    id: "sewing",
    name: "Sewing",
    fee: 1500,
    durationLabel: "6 months",
    summary:
      "Sewing, machine operation, stitching techniques and simple garment construction.",
    details:
      "Includes threading and maintaining a sewing machine, types of stitches, sewing buttons/zips, hemming, and simple pattern work for tailoring and alterations.",
    type: "long",
  },
];

// discount rules by number of courses (rubric)
function discountRateByCourseCount(n) {
  if (n <= 1) return 0;
  if (n === 2) return 0.05;
  if (n === 3) return 0.10;
  return 0.15;
}

// ------------------ Home Screen ------------------
function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.headerCard}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>EN</Text>
          </View>
          <Text style={styles.h1}>Empowering the Nation</Text>
          <Text style={styles.h2}>Building Skills. Changing Lives.</Text>
          <Text style={styles.bodyText}>
            Practical training for domestic workers and gardeners. Use the app to
            view programs, calculate fees, and apply — all saved locally for your records.
          </Text>

          <TouchableOpacity
            style={styles.cta}
            onPress={() => navRef.current?.navigate("Programs")}
          >
            <Text style={styles.ctaText}>View Programs</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickCardsRow}>
          <View style={styles.quickCard}>
            <FontAwesome5 name="chalkboard-teacher" size={22} color={THEME.primary} />
            <Text style={styles.quickTitle}>Training</Text>
            <Text style={styles.quickSub}>Short & long courses</Text>
          </View>

          <View style={styles.quickCard}>
            <Entypo name="map" size={22} color={THEME.primary} />
            <Text style={styles.quickTitle}>Venues</Text>
            <Text style={styles.quickSub}>Johannesburg locations</Text>
          </View>
        </View>

        <Text style={styles.footer}>© 2025 Empowering the Nation | Building Futures Together</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ------------------ Programs Screen (multi-select + calculator + details) ------------------
function ProgramsScreen() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [people, setPeople] = useState("1");
  const [quote, setQuote] = useState(null);
  const [modalCourse, setModalCourse] = useState(null); // for course details modal

  function toggleCourse(id) {
    setQuote(null);
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function calculateQuote() {
    const nPeople = parseInt(people || "0", 10);
    if (selectedIds.length === 0) {
      Alert.alert("Select courses", "Please select at least one course.");
      return;
    }
    if (!nPeople || nPeople <= 0) {
      Alert.alert("Invalid number", "Enter number of people (at least 1).");
      return;
    }

    const selectedCourses = COURSES.filter((c) => selectedIds.includes(c.id));
    const perPersonSum = selectedCourses.reduce((s, c) => s + c.fee, 0);
    const subtotal = perPersonSum * nPeople;
    const discRate = discountRateByCourseCount(selectedCourses.length);
    const discount = subtotal * discRate;
    const afterDiscount = subtotal - discount;
    const vat = afterDiscount * 0.15;
    const total = afterDiscount + vat;

    setQuote({
      selectedCourses,
      nPeople,
      perPersonSum,
      subtotal,
      discount,
      vat,
      total,
      discRate,
    });
  }

  function restart() {
    setSelectedIds([]);
    setPeople("1");
    setQuote(null);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.h1}>Programs & Fee Calculator</Text>
        <Text style={styles.bodyText}>
          Select one or more official courses, enter how many people will apply, then Calculate. Discount is by course count and VAT (15%) is added.
        </Text>

        <View style={{ marginTop: 12 }}>
          {COURSES.map((course) => {
            const selected = selectedIds.includes(course.id);
            return (
              <TouchableOpacity
                key={course.id}
                style={[
                  styles.courseRow,
                  selected && { borderColor: THEME.primary, borderWidth: 1.5, backgroundColor: "#f0f6ff" },
                ]}
                onPress={() => toggleCourse(course.id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.courseName}>{course.name}</Text>
                  <Text style={styles.courseMeta}>{course.durationLabel} • R{course.fee}</Text>
                  <Text numberOfLines={2} style={styles.courseSummary}>{course.summary}</Text>
                </View>
                <View style={{ justifyContent: "center", alignItems: "center" }}>
                  {selected ? (
                    <MaterialIcons name="check-circle" size={26} color={THEME.primary} />
                  ) : (
                    <MaterialIcons name="radio-button-unchecked" size={24} color="#999" />
                  )}
                </View>
                <TouchableOpacity
                  style={{ position: "absolute", right: 12, top: 12 }}
                  onPress={() => setModalCourse(course)}
                >
                  <Text style={{ color: THEME.primary }}>Details</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { marginTop: 8 }]}>Number of people applying</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={people}
          onChangeText={(t) => setPeople(t.replace(/[^0-9]/g, ""))}
          placeholder="e.g. 1"
        />

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={calculateQuote}><Text style={styles.primaryButtonText}>Calculate</Text></TouchableOpacity>
          <TouchableOpacity style={styles.outlineButton} onPress={restart}><Text style={styles.outlineButtonText}>Restart</Text></TouchableOpacity>
        </View>

        <View style={{ marginTop: 10, flexDirection: "row", justifyContent: "space-between" }}>
          <TouchableOpacity
            style={styles.smallBtn}
            onPress={() => {
              // refresh does nothing dramatic here; but keep as UI affordance: clears quote and re-reads nothing
              Alert.alert("Refreshed", "App state refreshed.");
            }}
          >
            <Text>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.smallBtnDanger}
            onPress={() => {
              Alert.alert("Clear saved data?", "This will remove saved applications and contacts from local storage.", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Clear All",
                  style: "destructive",
                  onPress: async () => {
                    await AsyncStorage.removeItem(STORAGE_KEY);
                    await AsyncStorage.removeItem(CONTACTS_KEY);
                    Alert.alert("Cleared", "Saved local data removed.");
                  },
                },
              ]);
            }}
          >
            <Text style={{ color: "#fff" }}>Clear Local Storage</Text>
          </TouchableOpacity>
        </View>

        {quote && (
          <View style={styles.quoteCard}>
            <Text style={styles.quoteTitle}>Quotation</Text>
            <Text>Courses: {quote.selectedCourses.map((c) => c.name).join(", ")}</Text>
            <Text>People: {quote.nPeople}</Text>
            <Text>Subtotal: R{quote.subtotal.toFixed(2)}</Text>
            <Text>Discount ({Math.round(quote.discRate * 100)}%): -R{quote.discount.toFixed(2)}</Text>
            <Text>VAT (15%): R{quote.vat.toFixed(2)}</Text>
            <Text style={styles.totalText}>Total: R{quote.total.toFixed(2)}</Text>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navRef.current?.navigate("Apply", { quote })}
            >
              <Text style={styles.secondaryButtonText}>Proceed to Apply</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Course details modal */}
      <Modal visible={!!modalCourse} animationType="slide" transparent>
        <SafeAreaView style={modalStyles.modalWrap}>
          <View style={modalStyles.modalCard}>
            <Text style={{ fontWeight: "900", fontSize: 18 }}>{modalCourse?.name}</Text>
            <Text style={{ marginTop: 8 }}>{modalCourse?.details}</Text>
            <TouchableOpacity style={{ marginTop: 12 }} onPress={() => setModalCourse(null)}>
              <Text style={{ color: THEME.primary, fontWeight: "800" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// ------------------ Apply Screen (application form, saves with receipt) ------------------
function ApplyScreen({ route, navigation }) {
  const { quote } = route.params || {};
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [receipt, setReceipt] = useState(null);

  async function submitApplication() {
    if (!quote) {
      Alert.alert("No quote", "Calculate a quote in Programs first.");
      return;
    }
    if (!name || !email || !phone) {
      Alert.alert("Missing details", "Please fill in name, email and phone.");
      return;
    }

    const app = {
      id: `app_${Date.now()}`,
      name,
      email,
      phone,
      courses: quote.selectedCourses.map((c) => c.name),
      people: quote.nPeople,
      subtotal: quote.subtotal,
      discount: quote.discount,
      vat: quote.vat,
      total: quote.total,
      timestamp: new Date().toISOString(),
      type: "application",
    };

    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const next = [app, ...list];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setReceipt(app);

      // clear input fields
      setName("");
      setEmail("");
      setPhone("");

      // navigate to Saved screen after a short delay or leave user to close receipt
    } catch (e) {
      Alert.alert("Save error", "Could not save application locally.");
    }
  }

  function closeReceipt() {
    setReceipt(null);
    navigation.navigate("Saved");
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.h1}>Application</Text>
        <Text style={styles.bodyText}>Complete your details to submit an application. The quote summary is shown below.</Text>

        {quote ? (
          <View style={styles.quoteCard}>
            <Text style={styles.quoteTitle}>Quoted Total</Text>
            <Text>Courses: {quote.selectedCourses.map((c) => c.name).join(", ")}</Text>
            <Text>People: {quote.nPeople}</Text>
            <Text style={styles.totalText}>Total: R{quote.total.toFixed(2)}</Text>
          </View>
        ) : (
          <Text style={{ marginVertical: 12 }}>No quote found. Go to Programs and calculate a quote first.</Text>
        )}

        <Text style={styles.label}>Full name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your full name" />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="email@example.com" />

        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={(t) => setPhone(t.replace(/[^0-9+]/g, ""))} keyboardType="phone-pad" placeholder="+27..." />

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={submitApplication}><Text style={styles.primaryButtonText}>Submit Application</Text></TouchableOpacity>
          <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.goBack()}><Text style={styles.outlineButtonText}>Back</Text></TouchableOpacity>
        </View>

        {/* receipt modal */}
        <Modal visible={!!receipt} transparent animationType="slide">
          <SafeAreaView style={modalStyles.modalWrap}>
            <View style={modalStyles.modalCard}>
              <Text style={{ fontWeight: "900", fontSize: 18, color: THEME.primary }}>Application Receipt</Text>
              <Text style={{ marginTop: 8, fontWeight: "800" }}>{receipt?.name}</Text>
              <Text>Courses: {receipt?.courses?.join(", ")}</Text>
              <Text>People: {receipt?.people}</Text>
              <Text>Total Paid (quote): R{Number(receipt?.total).toFixed(2)}</Text>
              <Text style={{ color: "#666", marginTop: 8 }}>{new Date(receipt?.timestamp).toLocaleString()}</Text>

              <TouchableOpacity style={[styles.primaryButton, { marginTop: 12 }]} onPress={closeReceipt}><Text style={styles.primaryButtonText}>Done</Text></TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}

// ------------------ Saved Applications & Contacts Screen ------------------
function SavedScreen() {
  const [records, setRecords] = useState([]);

  async function loadRecords() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      setRecords(list);
    } catch (e) {
      setRecords([]);
    }
  }

  useEffect(() => {
    loadRecords();
    // add simple nav ref listener to reload when tab is active
    const unsub = navRef.current?.addListener?.("state", loadRecords);
    return () => {
      if (unsub && typeof unsub === "function") unsub();
    };
  }, []);

  async function clearAll() {
    Alert.alert("Clear all", "Delete all saved applications?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem(STORAGE_KEY);
          setRecords([]);
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        contentContainerStyle={styles.screen}
        data={records}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.h1}>Saved Applications</Text>}
        ListEmptyComponent={<Text style={{ marginTop: 12 }}>No saved applications yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.recordCard}>
            <Text style={{ fontWeight: "800" }}>{item.name} — {item.courses?.join(", ")}</Text>
            <Text>People: {item.people}</Text>
            <Text>Total: R{Number(item.total).toFixed(2)}</Text>
            <Text style={{ color: "#666", marginTop: 6 }}>{new Date(item.timestamp).toLocaleString()}</Text>
          </View>
        )}
      />
      <View style={{ padding: 14 }}>
        <TouchableOpacity style={styles.clearBtn} onPress={clearAll}><Text style={{ color: "#fff", fontWeight: "800" }}>Clear All Saved</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ------------------ Contact Screen (stores contacts) ------------------
function ContactScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [savedPreview, setSavedPreview] = useState(null);

  async function saveContact() {
    if (!name || !email || !phone || !message) {
      Alert.alert("Missing fields", "Please fill in all fields");
      return;
    }
    const record = { id: `c_${Date.now()}`, type: "contact", name, email, phone, message, timestamp: new Date().toISOString() };

    try {
      const raw = await AsyncStorage.getItem(CONTACTS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      const next = [record, ...list];
      await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(next));
      setSavedPreview(record);
      setName(""); setEmail(""); setPhone(""); setMessage("");
      Alert.alert("Saved", "Contact saved locally.");
    } catch (e) {
      Alert.alert("Save error", "Could not save contact locally.");
    }
  }

  async function refreshContacts() {
    try {
      const raw = await AsyncStorage.getItem(CONTACTS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      if (list.length === 0) Alert.alert("No saved contacts");
      else Alert.alert("Saved contacts", `${list.length} saved locally.`);
    } catch {
      Alert.alert("Error", "Could not read contacts.");
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.h1}>Contact & Enquiries</Text>
        <Text style={styles.bodyText}>Send us a message or request. We store your message locally for demo/submission.</Text>

        <Text style={styles.label}>Full name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your full name" />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="email@example.com" />

        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={(t) => setPhone(t.replace(/[^0-9+]/g, ""))} keyboardType="phone-pad" placeholder="+27..." />

        <Text style={styles.label}>Message</Text>
        <TextInput style={[styles.input, { height: 100 }]} value={message} onChangeText={setMessage} placeholder="How can we help?" multiline />

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={saveContact}><Text style={styles.primaryButtonText}>Submit</Text></TouchableOpacity>
          <TouchableOpacity style={styles.outlineButton} onPress={() => { setName(""); setEmail(""); setPhone(""); setMessage(""); }}><Text style={styles.outlineButtonText}>Clear</Text></TouchableOpacity>
        </View>

        <View style={{ marginTop: 12 }}>
          <TouchableOpacity style={styles.smallBtn} onPress={refreshContacts}><Text>Refresh Contacts</Text></TouchableOpacity>
        </View>

        {savedPreview && (
          <View style={styles.savedCard}>
            <Text style={{ fontWeight: "800" }}>Saved</Text>
            <Text>{savedPreview.name} • {new Date(savedPreview.timestamp).toLocaleString()}</Text>
            <Text style={{ marginTop: 8 }}>{savedPreview.message}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ------------------ About Screen ------------------
function AboutScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.h1}>About Empowering the Nation</Text>
        <Text style={styles.bodyText}>
          Established in 2022 in Johannesburg to upskill domestic workers and gardeners. We provide practical, affordable training with both six-week short courses and six-month learnerships.
        </Text>

        <Text style={styles.sectionHeader}>Our Purpose</Text>
        <Text style={styles.bodyText}>Deliver accessible skills training to improve employment and entrepreneurship opportunities in the community.</Text>

        <Text style={styles.sectionHeader}>Contact</Text>
        <Text style={styles.bodyText}>Phone: +27 11 000 0000{'\n'}Email: info@empoweringthenation.org</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ------------------ App + Bottom Tabs ------------------
export default function App() {
  return (
    <NavigationContainer ref={navRef}>
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: THEME.primary,
          tabBarStyle: { height: 64, paddingBottom: 6 },
          tabBarIcon: ({ color, size }) => {
            if (route.name === "Home") return <Entypo name="home" size={size} color={color} />;
            if (route.name === "Programs") return <MaterialIcons name="school" size={size} color={color} />;
            if (route.name === "Apply") return <FontAwesome5 name="file-signature" size={size} color={color} />;
            if (route.name === "Saved") return <MaterialIcons name="folder" size={size} color={color} />;
            if (route.name === "Contact") return <Entypo name="phone" size={size} color={color} />;
            if (route.name === "About") return <FontAwesome5 name="info-circle" size={size} color={color} />;
            return null;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Programs" component={ProgramsScreen} />
        <Tab.Screen name="Apply" component={ApplyScreen} />
        <Tab.Screen name="Saved" component={SavedScreen} />
        <Tab.Screen name="Contact" component={ContactScreen} />
        <Tab.Screen name="About" component={AboutScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ------------------ Styles ------------------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: THEME.bg, paddingTop: Platform.OS === "android" ? 24 : 0 },
  screen: { padding: 14, paddingBottom: 40 },
  headerCard: { backgroundColor: THEME.card, borderRadius: 10, padding: 14, alignItems: "center", elevation: 2 },
  logoPlaceholder: { width: 86, height: 46, borderRadius: 8, backgroundColor: THEME.primary, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  logoText: { color: THEME.accent, fontWeight: "900", fontSize: 20 },
  h1: { color: THEME.primary, fontSize: 20, fontWeight: "900", marginTop: 6 },
  h2: { color: "#444", fontSize: 14, fontWeight: "700" },
  bodyText: { color: "#333", marginTop: 8, textAlign: "center" },
  cta: { marginTop: 12, backgroundColor: THEME.primary, padding: 12, borderRadius: 8, width: "80%" },
  ctaText: { color: THEME.accent, fontWeight: "900", textAlign: "center" },

  quickCardsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  quickCard: { width: "48%", backgroundColor: THEME.card, padding: 12, borderRadius: 8, alignItems: "center" },
  quickTitle: { fontWeight: "800", marginTop: 8, color: THEME.primary },
  quickSub: { color: "#666", marginTop: 4 },
  footer: { textAlign: "center", color: "#666", marginTop: 20 },

  courseRow: { backgroundColor: "#fff", borderRadius: 8, padding: 12, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", elevation: 1 },
  courseName: { fontWeight: "800", color: "#002a4d" },
  courseMeta: { color: "#0066cc", marginTop: 4 },
  courseSummary: { color: "#333", marginTop: 6 },

  label: { color: "#333", fontWeight: "800", marginBottom: 6 },
  input: { backgroundColor: "#fff", borderRadius: 8, padding: 10, borderWidth: 1, borderColor: "#e6f0ff", marginBottom: 8 },

  actionRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  primaryButton: { backgroundColor: THEME.primary, padding: 12, borderRadius: 8, flex: 1, marginRight: 8, alignItems: "center" },
  primaryButtonText: { color: THEME.accent, fontWeight: "900" },
  outlineButton: { borderWidth: 1, borderColor: THEME.primary, padding: 12, borderRadius: 8, flex: 1, marginLeft: 8, alignItems: "center" },
  outlineButtonText: { color: THEME.primary, fontWeight: "800" },

  quoteCard: { backgroundColor: "#fff", borderRadius: 8, padding: 12, marginTop: 14, elevation: 1 },
  quoteTitle: { fontWeight: "900", color: THEME.primary, marginBottom: 8 },
  totalText: { fontWeight: "900", marginTop: 8 },
  secondaryButton: { backgroundColor: "#fff", borderWidth: 1, borderColor: THEME.primary, padding: 10, borderRadius: 8, marginTop: 10, alignItems: "center" },
  secondaryButtonText: { color: THEME.primary, fontWeight: "800" },

  savedCard: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginTop: 12, elevation: 1 },
  recordCard: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 12, elevation: 1 },
  clearBtn: { backgroundColor: "#c0392b", padding: 12, borderRadius: 8, alignItems: "center" },

  sectionHeader: { fontWeight: "900", marginTop: 12, marginBottom: 6 },

  smallBtn: { borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 8 },
  smallBtnDanger: { backgroundColor: "#c0392b", padding: 8, borderRadius: 8, alignItems: "center" },
});

// Modal styles
const modalStyles = StyleSheet.create({
  modalWrap: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center" },
  modalCard: { margin: 20, backgroundColor: "#fff", borderRadius: 12, padding: 16, elevation: 6 },
});
